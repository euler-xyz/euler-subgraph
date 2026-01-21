import { Transfer as TransferEvent } from "../generated/templates/ERC4626Vault/EulerEarn"
import { trackActions } from "./utils/tracking"

export function handleTransfer(event: TransferEvent): void {
  trackActions(
    event.params.from,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )

  trackActions(
    event.params.to,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
  )
}
