$(document).ready(function () {
    function bindBrowserHandlers ($browser) {
        $browser.find('.close-browser-button').click(function () {
            var $btn = $(this);

            $.ajax({
                method:  'POST',
                url:     '/close',
                data:    {
                    browserId: $btn.data('browser-id')
                },
                success: function () {
                    $browser.remove();
                },
                error:   function (xhr) {
                    alert(xhr.statusText + ': ' + xhr.responseText);
                }
            });
        });

        $browser.find('.take-screenshot-button').click(function () {
            var $btn = $(this);

            $.ajax({
                method:  'POST',
                url:     '/take-screenshot',
                data:    {
                    browserId:      $btn.data('browser-id'),
                    screenshotPath: $browser.find('.screenshot-path').val()
                },
                success: function (res) {
                    $browser.find('.browser-screenshots-container').replaceWith(res)
                },
                error:   function (xhr) {
                    alert(xhr.statusText + ': ' + xhr.responseText);
                }
            });
        });

        $browser.find('.resize-browser-button').click(function () {
            var $btn = $(this);

            $.ajax({
                method: 'POST',
                url:    '/resize',
                data:   {
                    browserId:      $btn.data('browser-id'),
                    paramsType:     $browser.find('.params-type:checked').val(),
                    width:          $browser.find('.width').val(),
                    height:         $browser.find('.height').val(),
                    deviceName:     $browser.find('.device-name').val(),
                    orientation:    $browser.find('.orientation:checked').val()
                },
                error:  function (xhr) {
                    alert(xhr.statusText + ': ' + xhr.responseText);
                }
            });
        });

        $browser.find('.maximize-browser-button').click(function () {
            var $btn = $(this);

            $.ajax({
                method:  'POST',
                url:     '/maximize',
                data:    {
                    browserId: $btn.data('browser-id')
                },
                error:   function (xhr) {
                    alert(xhr.statusText + ': ' + xhr.responseText);
                }
            });
        });

        $browser.find('.bring-to-front-browser-button').click(function () {
            var $btn = $(this);

            $.ajax({
                method:  'POST',
                url:     '/bring-to-front',
                data:    {
                    browserId: $btn.data('browser-id')
                },
                error:   function (xhr) {
                    alert(xhr.statusText + ': ' + xhr.responseText);
                }
            });
        });
    }

    $('.browser').each(function () {
        bindBrowserHandlers($(this));
    });

    $('.installation').each(function () {
        var $item = $(this);

        $item.find('.open-browser-button').click(function () {
            var $btn = $(this);

            $.ajax({
                method:  'POST',
                url:     '/open',
                data:    {
                    browser: $btn.data('browser')
                },
                success: function (res) {
                    var $browser = $(res);
                    $('.browsers').append($browser);
                    bindBrowserHandlers($browser);
                },
                error:   function (xhr) {
                    alert(xhr.statusText + ': ' + xhr.responseText);
                }
            });
        });
    });
});
