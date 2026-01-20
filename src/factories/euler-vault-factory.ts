import { ProxyCreated as ProxyCreatedEvent } from "../../generated/EulerVaultFactory/EVaultFactory"
import { EulerVault as EulerVaultTemplate } from "../../generated/templates"
import { registerVault } from "../utils/vault"

export function handleProxyCreated(event: ProxyCreatedEvent): void {
  registerVault(event.params.proxy, event.address)
  EulerVaultTemplate.create(event.params.proxy)
}
