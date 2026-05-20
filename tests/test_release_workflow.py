#!/usr/bin/env python3
"""Regression tests for release workflow tag/release refresh behavior."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELEASE_WORKFLOW = ROOT / ".github" / "workflows" / "release.yml"


def test_existing_overlay_release_tag_is_moved_to_current_head() -> None:
    workflow = RELEASE_WORKFLOW.read_text(encoding="utf-8")

    assert 'git tag -f "${RELEASE_TAG}" HEAD' in workflow
    assert 'git push --force origin "${RELEASE_TAG}"' in workflow


def test_existing_overlay_release_notes_are_refreshed() -> None:
    workflow = RELEASE_WORKFLOW.read_text(encoding="utf-8")

    assert 'gh release edit "${RELEASE_TAG}"' in workflow
    assert '--notes-file /tmp/release-notes.md' in workflow


def _run_without_pytest() -> None:
    test_existing_overlay_release_tag_is_moved_to_current_head()
    test_existing_overlay_release_notes_are_refreshed()


if __name__ == "__main__":
    _run_without_pytest()
    print("release workflow regression tests passed")
