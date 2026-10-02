---Rate-limit and source checks for net events.
---Attached to GNS.Guard from server/main.lua. Server only.

local windows = {}

local function sourceId(src)
    src = tonumber(src)
    if not src or src <= 0 then return nil end
    return src
end

local Guard = {}

---Returns true while `src` stays under `limit` hits per `windowMs`.
---@param src number | string
---@param key string
---@param limit integer
---@param windowMs integer
---@return boolean
function Guard.allow(src, key, limit, windowMs)
    src = sourceId(src)
    if not src or type(key) ~= 'string' then return false end

    local now = GetGameTimer()
    local bucketKey = ('%s:%s'):format(src, key)
    local bucket = windows[bucketKey]

    if not bucket or (now - bucket.start) >= windowMs then
        windows[bucketKey] = { start = now, count = 1 }
        return true
    end

    if bucket.count >= limit then
        return false
    end

    bucket.count += 1
    return true
end

---@param src number | string
function Guard.clear(src)
    src = sourceId(src)
    if not src then return end
    local prefix = ('%s:'):format(src)
    for bucketKey in pairs(windows) do
        if bucketKey:sub(1, #prefix) == prefix then
            windows[bucketKey] = nil
        end
    end
end

return Guard
