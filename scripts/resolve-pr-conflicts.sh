#!/usr/bin/env bash
set -euo pipefail

PR_NUMBER="${PR_NUMBER:-${PR:-}}"
REPO="${REPO:-${GITHUB_REPOSITORY:-}}"
if [ -z "${PR_NUMBER}" ] || [ -z "${REPO}" ]; then
  echo "PR_NUMBER/PR and REPO/GITHUB_REPOSITORY are required" >&2
  exit 2
fi

MAX_ATTEMPTS="${MAX_CONFLICT_FIX_ATTEMPTS:-2}"
SYNC_METHOD="${CONFLICT_SYNC_METHOD:-merge}"       # merge | rebase
RESOLVE_MODE="${CONFLICT_RESOLVE_MODE:-whitelist}" # whitelist | ours | theirs
PREFERRED_SIDE="${CONFLICT_PREFERRED_SIDE:-theirs}" # ours | theirs
WHITELIST_RAW="${CONFLICT_RESOLVE_WHITELIST:-compatibility.json,CHANGELOG.md,.autofix/*,.github/workflows/*}"
COMMENT_ON_FAILURE="${COMMENT_ON_CONFLICT_FAILURE:-true}"

get_mergeable() {
  gh pr view "$PR_NUMBER" --repo "$REPO" --json mergeable --jq '.mergeable // "UNKNOWN"'
}

get_head_ref() {
  gh pr view "$PR_NUMBER" --repo "$REPO" --json headRefName --jq '.headRefName'
}

get_base_ref() {
  gh pr view "$PR_NUMBER" --repo "$REPO" --json baseRefName --jq '.baseRefName'
}

wait_mergeable() {
  local m=""
  for _ in $(seq 1 8); do
    m=$(gh pr view "$PR_NUMBER" --repo "$REPO" --json mergeable --jq '.mergeable // "UNKNOWN"')
    if [ "$m" != "UNKNOWN" ]; then
      echo "$m"
      return 0
    fi
    sleep 2
  done
  echo "$m"
}

is_whitelisted() {
  local f="$1"
  IFS=',' read -r -a globs <<<"$WHITELIST_RAW"
  for g in "${globs[@]}"; do
    g="${g## }"
    g="${g%% }"
    [ -z "$g" ] && continue
    if [[ "$f" == $g ]]; then
      return 0
    fi
  done
  return 1
}

resolve_file() {
  local file="$1"
  local side=""

  case "$RESOLVE_MODE" in
    ours|theirs)
      side="$RESOLVE_MODE"
      ;;
    whitelist)
      if ! is_whitelisted "$file"; then
        return 10
      fi
      side="$PREFERRED_SIDE"
      ;;
    *)
      echo "Unsupported CONFLICT_RESOLVE_MODE=$RESOLVE_MODE" >&2
      return 11
      ;;
  esac

  git checkout --"$side" -- "$file"
  git add "$file"
  return 0
}

post_block_comment() {
  local reason="$1"
  [ "$COMMENT_ON_FAILURE" = "true" ] || return 0
  cat > /tmp/pr-conflict-block-comment.md <<EOF
Automerge is blocked because conflicts could not be resolved safely.

PR: #$PR_NUMBER
Reason: $reason
Sync method: $SYNC_METHOD
Resolve mode: $RESOLVE_MODE
Preferred side: $PREFERRED_SIDE
Whitelist: $WHITELIST_RAW

Please resolve conflicts manually, then CI will re-run and automerge can continue.
EOF
  gh pr comment "$PR_NUMBER" --repo "$REPO" --body-file /tmp/pr-conflict-block-comment.md
}

updated=false

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  mergeable=$(get_mergeable)
  head=$(get_head_ref)
  base=$(get_base_ref)

  if [ "$mergeable" != "CONFLICTING" ]; then
    echo "updated=$updated" >> "$GITHUB_OUTPUT"
    echo "status=clean_or_unknown" >> "$GITHUB_OUTPUT"
    exit 0
  fi

  git fetch origin "$base" "$head"
  git checkout -B "$head" "origin/$head"

  set +e
  if [ "$SYNC_METHOD" = "rebase" ]; then
    git rebase "origin/$base"
  else
    git merge --no-ff --no-edit "origin/$base"
  fi
  rc=$?
  set -e

  if [ $rc -ne 0 ]; then
    mapfile -t files < <(git diff --name-only --diff-filter=U)
    if [ "${#files[@]}" -eq 0 ]; then
      post_block_comment "Conflict detected but conflicted file list is empty on attempt $attempt."
      echo "updated=$updated" >> "$GITHUB_OUTPUT"
      echo "status=blocked" >> "$GITHUB_OUTPUT"
      exit 1
    fi

    unresolved=()
    for f in "${files[@]}"; do
      if ! resolve_file "$f"; then
        unresolved+=("$f")
      fi
    done

    if [ "${#unresolved[@]}" -gt 0 ]; then
      if [ "$SYNC_METHOD" = "rebase" ]; then
        git rebase --abort || true
      else
        git merge --abort || true
      fi
      reason="Unsafe conflicts remain after attempt $attempt. Unresolved files: ${unresolved[*]}"
      post_block_comment "$reason"
      echo "updated=$updated" >> "$GITHUB_OUTPUT"
      echo "status=blocked" >> "$GITHUB_OUTPUT"
      exit 1
    fi

    if [ "$SYNC_METHOD" = "rebase" ]; then
      GIT_EDITOR=true git rebase --continue
    else
      git commit -m "chore(automerge): auto-resolve conflicts for PR #$PR_NUMBER (attempt $attempt)"
    fi
  fi

  git push origin "HEAD:$head"
  updated=true
  sleep 3
  mergeable_after=$(wait_mergeable)
  if [ "$mergeable_after" != "CONFLICTING" ]; then
    echo "updated=$updated" >> "$GITHUB_OUTPUT"
    echo "status=fixed" >> "$GITHUB_OUTPUT"
    exit 0
  fi

done

post_block_comment "Conflicts still exist after $MAX_ATTEMPTS automated attempts."
echo "updated=$updated" >> "$GITHUB_OUTPUT"
echo "status=blocked" >> "$GITHUB_OUTPUT"
exit 1
