$(document).ready(function() {
  $('.product-carousel').each(function (index, carousel) {
    $(carousel).on('mouseenter', function() {
      $(carousel).carousel({ interval: 750, ride: 'carousel', pause: false }).carousel('next');
    }).on('mouseleave', function () {
      $(carousel).carousel('pause');
    });
  });
});

function bindZoom() {
  $(".pr-photos").prPhotos();
}

(function($) {
  "use strict";

  // active element in sidenav
  var $product_grid = $(".product-grid");
  if ($product_grid.length) {
    var path = window.location.pathname;
    $("#menutree a").each(function(i, a) {
      if (path == a.pathname) {
        $(a).parents("li").addClass("active");
      }
    });
  }

  // pagination on product grid
  var $old_paginator = $("#pagination");
  if ($old_paginator.length) {
    var $paginator = $(".pr-paginator");
    $paginator.removeClass("hidden");
    $(".total-pages", $paginator).html($(".page", $old_paginator).length);
    $(".current-page", $paginator).html($(".page.selected a").html());

    var links = [
      [$(".first", $old_paginator), $(".first-page", $paginator)],
      [$(".next", $old_paginator), $(".next-page", $paginator)],
      [$(".previous", $old_paginator), $(".prev-page", $paginator)],
      [$(".last", $old_paginator), $(".last-page", $paginator)]
    ];
    links.forEach(function(link) {
      if (!link[0].hasClass("hidden")) {
        link[1].removeClass("hidden").attr("href", $("a", link[0]).attr("href"));
      }
    });
  }

  // product variation select
  $(".product-detail select").addClass("form-control gutter-bottom");
  $("option:contains(Variation)").html("Variation");

  // product images
  var prPhotos = function(element, options) {
    this.$el = $(element);
    this.options = options;
    this.init();
  };

  prPhotos.prototype = {
    init: function() {
      var self = this, images = [];
      $(".image", this.$el).each(function(i, image) {
        var $image = $(image);
        var im = {
          image: $image.attr("data-image"),
          thumb: $image.attr("data-thumb"),
          alt: $image.attr("data-alt"),
          index: i+1
        };
        images.push(im);
      });
      if (images.length) {
        var data = {
          primary_image: images[0],
          total_images: images.length
        };
        if (images.length > 1) {
          data.images = images;
          data.images[0].active = true;
          data.multiple_images = true;
        }
        var $pr_photos = $(Mustache.render($("#product-carousel-template").html(), data));
        self.$el.append($pr_photos);
        $(".pr-photos-toolbar a", this.$el).on("click", function(e) {
          e.preventDefault();
          $(".pr-photos-toolbar a", self.$el).removeClass("active");
          $(this).addClass("active");
          $(".primary-image img", self.$el).attr({
            src: $(this).attr("data-image"),
            alt: $(this).attr("data-alt")
          });
          $(".current-index", self.$el).html($(this).attr("data-index"));
        });

        $(".zoom, .primary-image img", this.$el).on("click", function(e) {
          e.preventDefault();
          var $im = $(".primary-image img");
          var $overlay = $(Mustache.render($("#image-zoom-template").html(), {
            image: $im.attr("src"),
            alt: $im.attr("alt")
          }));
          $overlay.on("click", function(e) {
            $overlay.remove();
          });
          $("body").append($overlay);
        });
      }
    }
  };

  $.fn.prPhotos = function(option) {
    var selector = this.selector;
    return this.each(function () {
      var $this = $(this)
      , data = $this.data('prPhotos')
      , options = $.extend($.fn.prPhotos.defaults, typeof option == 'object' && option);
      options['selector'] = selector;
      if (!data) $this.data('prPhotos', (data = new prPhotos(this, options)))
      if (typeof(option) == 'string') {
        data[action]();
      }
    });
  };
  $.fn.prPhotos.defaults = {};
  $(".pr-photos").prPhotos();

  var prEvents = function(element, options) {
    this.$el = $(element);
    this.options = options;
    this.init();
  };

  prEvents.prototype = {
    init: function() {
      var self = this;

      $.getJSON(this.$el.attr("data-url"), function(response) {
        self.renderEvents(response.data);
      });

      $(".pr-events").siblings().prepend(
        "<script type='text/html' id='event-template'>" +
          "<div class='pr-event'>" +
            "<h2 class='text-center'><a href='{{ link }}''><strong>{{ name }}</strong><br/>{{ start }}{{#end}} – {{ end }}{{/end}}</a></h2>" +
            "<div class='row'>" +
            "<div class='col-sm-6 description'>{{{ description }}}</div>" +
            "<div class='col-xs-6 col-sm-3 address'>" +
              "{{#place}}        <strong>{{name}}</strong><br/>" +
              "{{#location}}        {{street}}<br/>" +
              "{{city}}, {{state}}<br/>" +
              "{{zip}}        {{/location}}        {{/place}} </div>" +
            "<div class='col-xs-6 col-sm-3 join-link'><img width='100%' src='{{ img }}'/><br><a class='btn btn-primary' href='{{ link }}'>Join Event</a></div></div></div></script>")
    },

    renderEvents: function(events) {
      // resort
      var r_events = events.sort(function(a, b){
        var sorter = 0;
        if (moment(a.end_time).unix() < moment(b.end_time).unix()) {
          sorter = -1;
        } else {
          sorter = 1;
        }
        return sorter;
      });
      var self = this, now = moment().unix(), template = $("#event-template").html();;
      var upcomingEvents = r_events.some(function(event){
        var end = event.end_time;
        var start = event.start_time;
        var endDateTime = String(end).split('T');
        var startDateTime = String(start).split('T');
        var endDate = endDateTime[0];
        var startDate = startDateTime[0];
        var endUnix = moment(end).unix();
        return endUnix >= now;
      });

      if (!upcomingEvents) {
        self.$el.append("<br><h4>No upcoming events at this time.<br><br><a href='https://www.facebook.com/pg/pictureroomnyc/events/' target='_blank'>View past events →</a></h4>");
      } else {
        r_events.forEach(function(event) {
          var end = event.end_time;
          var start = event.start_time;
          var endDateTime = String(end).split('T');
          var startDateTime = String(start).split('T');
          var endDate = endDateTime[0];
          var startDate = startDateTime[0];
          var endUnix = moment(end).unix();
          if (endUnix >= now) {
            var data = {
              name: event.name,
              description: event.description.replace(/(?:\r\n|\r|\n)/g, '<br />'),
              link: "https://www.facebook.com/events/" + event.id + "/",
              place: event.place,
              img: event.picture_url
            };
            if (startDate === endDate) {
              data['start'] = moment(event.start_time).format("dddd MMMM D, h:mma");
              data['end'] = moment(event.end_time).format("h:mma");
            } else {
              data['start'] = moment(event.start_time).format("MMMM D, h:mma");
              data['end'] = moment(event.end_time).format("MMMM D, h:mma");
            }
            var $event = $(Mustache.render(template, data));
            self.$el.append($event);
          }
        });}
      $(".description", this.$el).linkify();
    }
  };

  $.fn.prEvents = function(option) {
    var selector = this.selector;
    return this.each(function () {
      var $this = $(this)
      , data = $this.data('prEvents')
      , options = $.extend($.fn.prEvents.defaults, typeof option == 'object' && option);
      options['selector'] = selector;
      if (!data) $this.data('prEvents', (data = new prEvents(this, options)))
      if (typeof(option) == 'string') {
        data[action]();
      }
    });
  };
  $.fn.prEvents.defaults = {};
  $(".pr-events").prEvents();

  $(".carousel").carousel({
    interval: 5000
  });

  $(".home-carousel").on("slid.bs.carousel", function(e) {
    $(".slide-count .current", e.currentTarget).html($(".item", e.currentTarget).index($(".item.active", e.currentTarget)) + 1);
    $(e.currentTarget).carousel("pause");
  });

  // staff picks
  $(".staff-member").on("click", function(e) {
    e.preventDefault();
    $(".staff-member, .staff-bio, .staff-products").removeClass("active");
    $(this).addClass("active");

    var staff_id = $(this).attr("data-id");
    $(".staff-bio[data-id=" + staff_id + "]").addClass("active");
    $(".staff-products[data-id=" + staff_id + "]").addClass("active");
  });

  // menu toggle
  $(".menu-toggle").on("click", function(e) {
    e.preventDefault();
    $("#menubar, .side-nav").toggleClass("hidden-xs");
  });

  // featured artist
  var re = /\/brand\/(\S*)/, m;
  if ((m = re.exec(window.location.pathname)) !== null) {
    if (m.index === re.lastIndex) {
        re.lastIndex++;
    }

    var brand = m[1];
    $(".featured-artist[data-brand='" + brand + "']").addClass("active");
  }

  var $prev_artists = $(".previous-artists");
  if ($prev_artists.length) {
    $(".product-grid").after($prev_artists.addClass("active"));
  }

})(jQuery);
