local function findVehFromPlateAndLocate(plate)
	local gameVehicles = GetGamePool('CVehicle')
	for i = 1, #gameVehicles do
		local vehicle = gameVehicles[i]
		if DoesEntityExist(vehicle) then
			if gns.getVehiclePlate(vehicle) == plate then
				local vehCoords = GetEntityCoords(vehicle)
				SetNewWaypoint(vehCoords.x, vehCoords.y)
				return true
			end
		end
	end
end

RegisterNUICallback("npwd:gns_garage:getVehicles", function(_, cb)
	local vehicles = lib.callback.await('npwd_gns_garages:server:getPlayerVehicles', false)
	for _, v in pairs(vehicles) do
		local type = GetVehicleClassFromName(v.model)
		if type == 15 or type == 16 then
			v.type = "aircraft"
		elseif type == 14 then
			v.type = "boat"
		elseif type == 13 or type == 8 then
			v.type = "bike"
		else
			v.type = "car"
		end
	end

	cb({ status = "ok", data = vehicles })
end)

RegisterNUICallback("npwd:gns_garage:requestWaypoint", function(data, cb)
    exports.npwd:createNotification({
        notisId = 'npwd:gns_garage:requestWaypoint',
        appId = 'npwd_gns_garages',
        content = findVehFromPlateAndLocate(data.plate) and locale('notification.marked') or locale('notification.cannot_locate'),
        keepOpen = false,
        duration = 5000,
        path = '/npwd_gns_garages',
    })
	cb({})
end)
