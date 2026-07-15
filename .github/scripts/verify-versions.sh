#!/usr/bin/env bash
# verify-versions.sh
#
# Compares package versions across three sources (package.json, git tags, npm registry)
# for all releasable packages in this monorepo. Intended to run before `nx release`
# in CI to prevent releasing from an inconsistent state.
#
# Tag pattern (from nx.json): {projectName}@{version}
# where projectName = directory name under packages/ (e.g. react-kessel-access-check)
#
# Exit 0: all versions aligned
# Exit 1: at least one mismatch detected

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

mismatch=0
printf "%-60s %-12s %-12s %-15s %s\n" "PACKAGE" "DISK" "GIT TAG" "NPM" "STATUS"
printf '%.0s-' {1..110}
printf '\n'

for dir in "$REPO_ROOT"/packages/*/; do
  dirname="$(basename "$dir")"

  pkg_json="$dir/package.json"
  if [[ ! -f "$pkg_json" ]]; then
    continue
  fi

  pkg="$(node -p "require('$pkg_json').name")"
  disk_ver="$(node -p "require('$pkg_json').version")"

  private="$(node -p "require('$pkg_json').private || false")"
  if [[ "$private" == "true" ]]; then
    continue
  fi

  # NX uses the directory name as projectName in tags: {projectName}@{version}
  nx_project="$dirname"

  # --- Git tag version ---
  tag_ver="$(
    git tag --merged HEAD --list "${nx_project}@*" \
      | sed "s|^${nx_project}@||" \
      | grep '^[0-9]' \
      | sort -V \
      | tail -1
  )" || true
  [[ -z "$tag_ver" ]] && tag_ver="NONE"

  # --- npm registry version ---
  npm_ver="$(npm view "$pkg" version --fetch-timeout=10000 2>/dev/null)" || true
  [[ -z "$npm_ver" ]] && npm_ver="NOT_ON_NPM"

  # --- Compare ---
  if [[ "$disk_ver" == "$tag_ver" && "$disk_ver" == "$npm_ver" ]]; then
    status="OK"
    marker="✓"
  elif [[ "$tag_ver" == "NONE" && "$npm_ver" == "NOT_ON_NPM" ]]; then
    status="NEW_PACKAGE"
    marker="!"
    mismatch=1
    echo "::error::${pkg}: new/unpublished package (disk=${disk_ver}, tag=NONE, npm=NOT_ON_NPM). Verify this is intentional."
  else
    status="MISMATCH"
    marker="✗"
    mismatch=1
    echo "::error::${pkg}: version mismatch (disk=${disk_ver}, tag=${tag_ver}, npm=${npm_ver})"
  fi

  printf "%-60s %-12s %-12s %-15s %s %s\n" "$pkg" "$disk_ver" "$tag_ver" "$npm_ver" "$marker" "$status"
done

echo ""
if [[ $mismatch -ne 0 ]]; then
  echo "Version verification FAILED. Fix mismatches before releasing."
  exit 1
else
  echo "All package versions are aligned across disk, git tags, and npm registry."
  exit 0
fi
