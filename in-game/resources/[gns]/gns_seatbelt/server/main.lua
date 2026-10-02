SetConvarReplicated('game_enableFlyThroughWindscreen', 'true')

exports.gns_core:CreateUseableItem('harness', function(source, item)
    TriggerClientEvent('gns_seatbelt:client:UseHarness', source, item)
end)

RegisterNetEvent('gns_seatbelt:server:equip', function(slotid)
    if math.type(slotid) ~= 'integer' then return end

    local item = exports.ox_inventory:GetSlot(source, slotid)
    if not item or item.name ~= 'harness' then return end

    local itemData = type(item.metadata) == 'table' and item.metadata or {}
    local newDura = (tonumber(itemData.durability) or 100) - 5
    if newDura <= 0 then
        exports.ox_inventory:RemoveItem(source, item.name, 1, itemData, slotid)
    else
        itemData.durability = newDura
        exports.ox_inventory:SetMetadata(source, slotid, itemData)
    end
end)
