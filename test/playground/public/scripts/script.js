$(document).ready(function () {
    function bindBrowserHandlers ($browser) {
        $browser.find('.close-browser-button').click(function () {
            var $btn = $(this);

            $.ajax({
                method:  'POST',
                url:     '/close-browser',
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
                method: 'POST',
                url:    '/take-screenshot',
                data:   {
                    browserId:      $btn.data('browser-id'),
                    screenshotPath: $browser.find('.screenshot-path').val()
                },
                error:  function (xhr) {
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
                url:     '/open-browser',
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
