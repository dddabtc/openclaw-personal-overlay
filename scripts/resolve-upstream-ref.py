#!/usr/bin/env python3
"""Resolve the upstream openclaw commit SHA for a given GitHub ref.

Reads compatibility.json and returns the commitSha for the version that
matches the tag being built (overlay-v<VERSION>). Falls back to the first
non-deprecated entry when no exact version match is found.

Usage:
  python3 scripts/resolve-upstream-ref.py <compatibility.json> [github-ref]

If github-ref is not given, reads the GITHUB_REF environment variable.

Output:
  Prints commit SHA to stdout.
  When GITHUB_OUTPUT is set (GitHub Actions), also writes
  'upstream_sha=<sha>' to that file for use as a step output.
"""

import json
import os
import sys

TAG_PREFIX = "refs/tags/overlay-v"


def main():
    compat_file = sys.argv[1] if len(sys.argv) > 1 else "compatibility.json"
    github_ref = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("GITHUB_REF", "")

    with open(compat_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    supported = [e for e in data.get("supported", []) if e.get("status") != "deprecated"]

    if not supported:
        print(
            "ERROR: no supported (non-deprecated) entries found in compatibility.json",
            file=sys.stderr,
        )
        sys.exit(1)

    commit_sha = None

    if github_ref.startswith(TAG_PREFIX):
        tag_version = github_ref[len(TAG_PREFIX):]
        for entry in supported:
            if entry.get("openclawVersion") == tag_version:
                commit_sha = entry["commitSha"]
                print(
                    f"Resolved commit for version {tag_version}: {commit_sha}",
                    file=sys.stderr,
                )
                break

        if commit_sha is None:
            print(
                f"No exact match for version {tag_version!r} in compatibility.json; "
                "falling back to latest non-deprecated entry.",
                file=sys.stderr,
            )

    if commit_sha is None:
        commit_sha = supported[0]["commitSha"]
        print(
            f"Using latest non-deprecated entry: commitSha={commit_sha}",
            file=sys.stderr,
        )

    print(commit_sha)

    # Set GitHub Actions step output when running in CI.
    github_output = os.environ.get("GITHUB_OUTPUT", "")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as gh:
            gh.write(f"upstream_sha={commit_sha}\n")


if __name__ == "__main__":
    main()
