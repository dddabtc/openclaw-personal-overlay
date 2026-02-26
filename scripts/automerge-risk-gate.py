#!/usr/bin/env python3
import json
import os
import re
import subprocess
import sys
from pathlib import Path


def run(cmd):
    return subprocess.check_output(cmd, text=True)


def load_policy(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def match_any(patterns, text):
    return any(re.search(p, text) for p in patterns)


def main():
    policy_path = os.environ.get('POLICY_FILE', '.github/automerge-policy.json')
    base = os.environ.get('BASE_REF', 'origin/main')
    head = os.environ.get('HEAD_REF', 'HEAD')

    policy = load_policy(policy_path)

    numstat = run(['git', 'diff', '--numstat', f'{base}...{head}']).strip().splitlines()
    files = []
    total_changes = 0
    risk_score = 0.0
    blocked = []
    outside = []

    for line in numstat:
        if not line.strip():
            continue
        a, d, p = line.split('\t', 2)
        add = 0 if a == '-' else int(a)
        dele = 0 if d == '-' else int(d)
        changed = add + dele
        total_changes += changed

        file_risk = 0.0
        if match_any(policy['blockedPatterns'], p):
            blocked.append(p)
            file_risk += 100
        elif not match_any(policy['allowedPatterns'], p):
            outside.append(p)
            file_risk += 20
        elif p.startswith('.github/workflows/'):
            file_risk += 2.0
        elif p.startswith('scripts/'):
            file_risk += 2.0
        elif p.startswith('docs/'):
            file_risk += 0.2
        elif p.startswith('.autofix/') or p in ('compatibility.json', 'CHANGELOG.md'):
            file_risk += 0.5

        file_risk += min(5.0, changed / 120.0)
        risk_score += file_risk
        files.append({'path': p, 'additions': add, 'deletions': dele, 'changes': changed, 'risk': round(file_risk, 2)})

    allow = (
        len(files) <= int(policy['maxFiles'])
        and total_changes <= int(policy['maxTotalChanges'])
        and risk_score <= float(policy['maxRiskScore'])
        and not blocked
        and not outside
    )

    error_code = 'OK'
    if blocked:
        error_code = 'E_POLICY_BLOCKED_PATH'
    elif outside:
        error_code = 'E_POLICY_OUTSIDE_WHITELIST'
    elif len(files) > int(policy['maxFiles']):
        error_code = 'E_POLICY_TOO_MANY_FILES'
    elif total_changes > int(policy['maxTotalChanges']):
        error_code = 'E_POLICY_TOO_LARGE'
    elif risk_score > float(policy['maxRiskScore']):
        error_code = 'E_POLICY_RISK_TOO_HIGH'

    report = {
        'tier': policy.get('tier', 'B+'),
        'allow_automerge': allow,
        'error_code': error_code,
        'summary': {
            'files_changed': len(files),
            'total_changes': total_changes,
            'risk_score': round(risk_score, 2),
            'max_files': policy['maxFiles'],
            'max_total_changes': policy['maxTotalChanges'],
            'max_risk_score': policy['maxRiskScore'],
        },
        'blocked_paths': blocked,
        'outside_whitelist': outside,
        'files': files,
    }

    out = os.environ.get('RISK_REPORT', '.autofix/risk-report.json')
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(json.dumps(report, ensure_ascii=False))

    github_output = os.environ.get('GITHUB_OUTPUT')
    if github_output:
        with open(github_output, 'a', encoding='utf-8') as f:
            f.write(f"allow_automerge={'true' if allow else 'false'}\n")
            f.write(f"error_code={error_code}\n")

    if not allow:
        sys.exit(2)


if __name__ == '__main__':
    main()
