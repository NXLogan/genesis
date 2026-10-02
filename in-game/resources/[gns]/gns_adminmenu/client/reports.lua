local function reportAction(selected, report)
    if selected == 1 then
        lib.alertDialog({
            header = ('Report ID: %s | Sender: %s'):format(report.id, report.senderName),
            content = ('message: %s'):format(report.message),
            centered = true,
            cancel = false,
            size = 'lg',
            labels = {
                confirm = 'Close'
            }
        })

        lib.showMenu(('gns_adminmenu_reports_menu_%s'):format(report.id), MenuIndexes[('gns_adminmenu_reports_menu_%s'):format(report.id)])
    elseif selected == 2 then
        local input = lib.inputDialog(('Report ID: %s | Sender: %s'):format(report.id, report.senderName), {
            {type = 'input', label = 'Reply'}
        })
        if input[1] == '' then
            exports.gns_core:Notify(locale('error.no_report_reply'), 'error')
        else
            TriggerServerEvent('gns_admin:server:sendReply', report, input[1])
        end

        lib.showMenu(('gns_adminmenu_reports_menu_%s'):format(report.id), MenuIndexes[('gns_adminmenu_reports_menu_%s'):format(report.id)])
    elseif selected == 3 then
        TriggerServerEvent('gns_admin:server:deleteReport', report)
        GenerateReportMenu()
    else
        return lib.showMenu(('gns_adminmenu_reports_menu_%s'):format(report.id), MenuIndexes[('gns_adminmenu_reports_menu_%s'):format(report.id)])
    end
end

function GenerateReportMenu()
    local reports = lib.callback.await('gns_admin:server:getReports', false)

    if not reports or #reports < 1 then
        exports.gns_core:Notify(locale('error.no_reports'), 'error')
        return lib.showMenu('gns_adminmenu_main_menu', MenuIndexes.gns_adminmenu_main_menu)
    else
        exports.gns_core:Notify(locale('success.report_load'):format(#reports), 'success')
    end

    local reportsList = {}
    for i = 1, #reports do
        reportsList[i] = {label = locale('report_options.label1'):format(reports[i].id, reports[i].senderName), description = locale('report_options.desc1'), args = {reports[i]}}
    end

    lib.registerMenu({
        id = 'gns_adminmenu_reports_menu',
        title = locale('title.reports_menu'),
        position = 'top-right',
        onClose = function(keyPressed)
            CloseMenu(false, keyPressed, 'gns_adminmenu_main_menu')
        end,
        onSelected = function(selected)
            MenuIndexes.gns_adminmenu_reports_menu = selected
        end,
        options = reportsList
    }, function(_, _, args)
        local report = args[1]

        lib.registerMenu({
            id = ('gns_adminmenu_reports_menu_%s'):format(report.id),
            title = ('Report ID: %s | Sender: %s'):format(report.id, report.senderName),
            position = 'top-right',
            onClose = function(keyPressed)
                CloseMenu(false, keyPressed, 'gns_adminmenu_reports_menu')
            end,
            onSelected = function(selected)
                MenuIndexes[('gns_adminmenu_reports_menu_%s'):format(report.id)] = selected
            end,
            options = {
                {label = 'View Message', icon = 'fas fa-message'},
                {label = 'Send Message', icon = 'fas fa-reply'},
                {label = 'Close Report', icon = 'fas fa-trash'},
                {label = ('Claimed By: %s'):format(report.claimed)},
                {label = ('Report ID: %s'):format(report.id)},
                {label = ('Sender ID: %s'):format(report.senderId)},
                {label = ('Sender Name: %s'):format(report.senderName)}
            }
        }, function(selected)
            reportAction(selected, report)
        end)
        lib.showMenu(('gns_adminmenu_reports_menu_%s'):format(report.id), MenuIndexes[('gns_adminmenu_reports_menu_%s'):format(report.id)])
    end)

    lib.showMenu('gns_adminmenu_reports_menu', MenuIndexes.gns_adminmenu_reports_menu)
end