import {
  ProxyCreated as ProxyCreatedEvent,
} from "../../generated/EulerVaultFactory/EVaultFactory"
import { EulerVault as EulerVaultTemplate } from "../../generated/templates"
import { Vault } from "../../generated/schema"

export function handleProxyCreated(event: ProxyCreatedEvent): void {
  let vault = new Vault(event.params.proxy)
  vault.factory = event.address
  vault.save()

  EulerVaultTemplate.create(event.params.proxy)
}
