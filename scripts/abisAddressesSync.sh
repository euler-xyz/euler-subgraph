#!/bin/bash

function process_abis() {
  local euler_interfaces_path=$1
  local abi_path=$2
  shift 2

  local -a contracts=("${@:1:$((($#)/2))}")
  local -a abis=("${@:$((($#)/2+1))}")

  mkdir -p "$abi_path"

  for i in "${!contracts[@]}"; do
    echo "Processing ${contracts[$i]}.json -> ${abis[$i]}.ts"

    cp "$euler_interfaces_path/abis/${contracts[$i]}.json" "$abi_path/${abis[$i]}.ts"

    sed -i '' '1s/^/export const '"${abis[$i]}"' = /' "$abi_path/${abis[$i]}.ts"
    sed -i '' -e '$ s/]$/] as const/' "$abi_path/${abis[$i]}.ts"

    npx prettier --write "$abi_path/${abis[$i]}.ts" >/dev/null
    sed -i '' -e '$ s/] as const;$/] as const/' "$abi_path/${abis[$i]}.ts"
  done

  create_index_ts "$abi_path"
}

function process_addresses() {
  local euler_interfaces_path=$1
  local addresses_path=$2
  local network_id=$3
  shift 3

  local -a jsons=("${@:1:$((($#)/2))}")
  local -a addresses=("${@:$((($#)/2+1))}")

  mkdir -p "$addresses_path"

  for i in "${!jsons[@]}"; do
    echo "Processing ${jsons[$i]}.json -> ${addresses[$i]}.ts"

    cp "$euler_interfaces_path/addresses/${network_id}/${jsons[$i]}.json" "$addresses_path/${addresses[$i]}.ts"

    sed -i '' '1s/^/export const '"${addresses[$i]}"' = /' "$addresses_path/${addresses[$i]}.ts"
    sed -i '' -e '$ s/}$/} as const/' "$addresses_path/${addresses[$i]}.ts"

    npx prettier --write "$addresses_path/${addresses[$i]}.ts" >/dev/null
    sed -i '' -e '$ s/;$//' "$addresses_path/${addresses[$i]}.ts"
  done

  create_index_ts "$addresses_path"
}

function create_index_ts() {
  local path=$1
  echo "Creating index.ts"
  (
    for file in "$path"/*.ts; do
      if [ -f "$file" ] && [ "$(basename "$file")" != "index.ts" ]; then
        filename=$(basename "$file" .ts)
        echo "export * from \"./${filename}\""
      fi
    done
  ) >"$path/index.ts"
  npx prettier --write --semi false "$path/index.ts" >/dev/null
}

if [ -z "$1" ]; then
  echo "Usage: $0 <network_id> [euler-interfaces-branch]"
  exit 1
fi

set -e
trap 'rm -rf "$temp_dir"' EXIT

network_id=$1
euler_interfaces_repo_name="euler-interfaces"
euler_interfaces_repo_url="https://github.com/euler-xyz/${euler_interfaces_repo_name}"
euler_interfaces_branch=${2:-"master"}
abi_path=contracts/abi
lens_abi_path=contracts/abi/lens/${network_id}
addresses_path=contracts/addresses/${network_id}
temp_dir=$(mktemp -d)

git clone "$euler_interfaces_repo_url.git" "$temp_dir"

cd "$temp_dir"
git checkout "$euler_interfaces_branch"
cd -

contracts=("BasePerspective" "EthereumVaultConnector" "EVault" "Swapper" "SwapVerifier" "TrackingRewardStreams" "TermsOfUseSigner" "RewardToken" "FeeFlowController")
abis=("basePerspectiveAbi" "ethereumVaultConnectorAbi" "eVaultAbi" "swapperAbi" "swapVerifierAbi" "trackingRewardStreamsAbi" "termsOfUseSignerAbi" "rewardTokenAbi" "feeFlowControllerAbi")
process_abis "$temp_dir" "$abi_path" "${contracts[@]}" "${abis[@]}"

lens_contracts=("AccountLens" "VaultLens" "EulerEarnVaultLens" "UtilsLens")
lens_abis=("accountLensAbi" "vaultLensAbi" "eulerEarnVaultLensAbi" "utilsLensAbi")
process_abis "$temp_dir" "$lens_abi_path" "${lens_contracts[@]}" "${lens_abis[@]}"

jsons=("CoreAddresses" "PeripheryAddresses" "LensAddresses" "TokenAddresses")
addresses=("coreAddresses" "peripheryAddresses" "lensAddresses" "tokenAddresses")
process_addresses "$temp_dir" "$addresses_path" "$network_id" "${jsons[@]}" "${addresses[@]}"
