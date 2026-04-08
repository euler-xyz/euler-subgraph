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
  echo "       $0 test <network_id> [euler-interfaces-branch]"
  echo "       $0 chain-test <network_id> [euler-interfaces-branch]"
  echo ""
  echo "  Normal:     Download addresses from repo addresses/<network_id>/ to contracts/addresses/<network_id>/"
  echo "  test:       Download from repo addresses/test/ to contracts/addresses/<network_id>/ (e.g. 11155111 for Sepolia)"
  echo "  chain-test: Download from repo addresses/chain-test/ to contracts/addresses/<network_id>/"
  exit 1
fi

set -e
trap 'rm -rf "$temp_dir"' EXIT

euler_interfaces_repo_name="euler-interfaces"
euler_interfaces_repo_url="https://github.com/euler-xyz/${euler_interfaces_repo_name}"

if [ "$1" = "test" ] || [ "$1" = "chain-test" ]; then
  addresses_source=$1
  if [ -z "$2" ]; then
    echo "Error: $1 requires a network_id (e.g. 11155111 for Sepolia)"
    exit 1
  fi
  network_id=$2
  euler_interfaces_branch=${3:-"master"}
  # Repo has addresses/test/<network_id>/ and addresses/chain-test/<network_id>/
  addresses_repo_path="${addresses_source}/${network_id}"
else
  addresses_source=$1
  network_id=$1
  euler_interfaces_branch=${2:-"master"}
  addresses_repo_path="${network_id}"
fi

abi_path=contracts/abi
lens_abi_path=contracts/abi/lens/${network_id}
addresses_path=contracts/addresses/${network_id}
temp_dir=$(mktemp -d)

git clone "$euler_interfaces_repo_url.git" "$temp_dir"

cd "$temp_dir"
git checkout "$euler_interfaces_branch"
cd -

contracts=("BasePerspective" "EthereumVaultConnector" "EVault" "Swapper" "SwapVerifier" "TrackingRewardStreams" "TermsOfUseSigner" "RewardToken" "FeeFlowController" "ERC4626EVCCollateralSecuritizeFactory")
abis=("basePerspectiveAbi" "ethereumVaultConnectorAbi" "eVaultAbi" "swapperAbi" "swapVerifierAbi" "trackingRewardStreamsAbi" "termsOfUseSignerAbi" "rewardTokenAbi" "feeFlowControllerAbi")
process_abis "$temp_dir" "$abi_path" "${contracts[@]}" "${abis[@]}"

lens_contracts=("AccountLens" "VaultLens" "EulerEarnVaultLens" "UtilsLens")
lens_abis=("accountLensAbi" "vaultLensAbi" "eulerEarnVaultLensAbi" "utilsLensAbi")
process_abis "$temp_dir" "$lens_abi_path" "${lens_contracts[@]}" "${lens_abis[@]}"

jsons=("CoreAddresses" "PeripheryAddresses" "LensAddresses" "TokenAddresses")
addresses=("coreAddresses" "peripheryAddresses" "lensAddresses" "tokenAddresses")
process_addresses "$temp_dir" "$addresses_path" "$addresses_repo_path" "${jsons[@]}" "${addresses[@]}"
