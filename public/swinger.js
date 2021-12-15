$.fn.swinger = function () {
    return this.each(function () {
        var $container = $(this);
        $container.css({
            "position": "relative"
        });
        var $images = $container.find("img");
        $images.css({
            "position": "absolute",
            "top": "0%",
            "left": "0%",
            "width": "100%"
        });
        var $middleImage = $($images[Math.floor($images.length / 2)]);
        $middleImage.css({
            "z-index": "2",
            "position": "relative"
        });
        var columnsCount = $images.length;
        $images.each((i, img) => {
            var left = `${100 / columnsCount * i}%`;
            var width = `${100 / columnsCount}%`;
            var $column = $(`<span style="z-index:999;position:absolute;top:0;bottom:0;left:${left};width:${width}"></span>`);
            $(img).after($column);
            $column.hover(() => {
                $images.css({
                    "z-index": "1",
                    "position": "absolute"
                });
                $(img).css({
                    "z-index": "2",
                    "position": "relative"
                });
            });
        })
    });
}