/**
 * Copyright (c) 2011-2012 Gerwin Sturm, FoldedSoft e.U. / www.foldedsoft.at
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License
 */

(function (global) {
  "use strict";

  var $ = global.$;

  Date.prototype.niceDate = function () {
    var y, m, d, h, min, now;
    now = new Date();
    y = this.getFullYear().toString();
    m = (this.getMonth() + 1).toString();
    d = this.getDate().toString();
    h = this.getHours().toString();
    min = this.getMinutes().toString();
    if (this.getFullYear() === now.getFullYear() && this.getMonth() === now.getMonth() && this.getDate() === now.getDate()) {
      return (h[1] ? h : "0" + h[0]) + ":" + (min[1] ? min : "0" + min[0]);
    }
    return y + "-" + (m[1] ? m : "0" + m[0]) + "-" + (d[1] ? d : "0" + d[0]) + " " + (h[1] ? h : "0" + h[0]) + ":" + (min[1] ? min : "0" + min[0]);
  };

  global.CommentTracker = function () {
    var
      posts, shared_posts, color_count, comments, oldest_first, parentDiv, apiKey, ytApiKey,
      PLUS_POST, YT_POST, PLUS_SEARCH, TWITTER_WIDGET, PLUS_STREAM, PLUS_COMMUNITY, textScreen,
      use_colors, imgUrl, search_id, show_hidden, show_hidden_shares, add_url, add_post, tracker_url, search, video_id;

    tracker_url = "http://www.allmyplus.com/comment-tracker/app.html";
    color_count = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    posts = [];
    shared_posts = [];
    comments = [];
    oldest_first = false;
    PLUS_POST = 1;
    YT_POST = 2;
    PLUS_SEARCH = 3;
    TWITTER_WIDGET = 4;
    PLUS_STREAM = 5;
    PLUS_COMMUNITY = 6;
    use_colors = true;
    search_id = 1;
    show_hidden = false;
    show_hidden_shares = false;

    function comment_sort(a, b) {
      return a.published.getTime() - b.published.getTime();
    }

    function strip_html(html) {
      var tmp = global.document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText;
    }

    function Comment(post, comment_id, author_name, author_pic, published, updated, content, url, activity_id) {
      this.post = post;
      this.url = url || this.post.url;
      this.activity_id = activity_id;
      this.comment_id = comment_id.replace(/\W/gi, "_");
      this.author_name = author_name;
      this.author_pic = author_pic;
      this.published = published;
      this.updated = updated;
      this.content = content;
      this.chk_delete = false;
      this.chk_deleted = false;
      this.chk_updated = false;
      this.chk_found = true;
      this.chk_hidden = false;
      this.chk_pinned = false;

      this.get_contents = function () {
        var str_comment = "", str_classes = "ct-comment";
        if (this.chk_pinned) {
          str_classes += " ct-important";
        }
        if (this.chk_hidden) {
          str_classes += " ct-hidden";
        }
        if (use_colors) {
          str_classes += " ct-background-" + this.post.color;
        } else {
          str_classes += " ct-background-0";
        }
        str_comment += "<div id=\"" + this.comment_id + "\" class=\"" + str_classes + "\">";
        str_comment += "<div class=\"ct-actions\">";
        if (this.post.post_type === PLUS_SEARCH || this.post.post_type === PLUS_STREAM || this.post.post_type === PLUS_COMMUNITY) {
          str_comment += "<div class=\"ct-action ct-action_track\" title=\"Track comments\"></div>";
        }
        str_comment += "<div class=\"ct-action ct-action_watch\" title=\"Show overlay\"></div>";
        str_comment += "<div class=\"ct-action ct-action_unwatch\" title=\"Hide overlay\" style=\"display: none\"></div>";
        str_comment += "<div class=\"ct-action ct-action_hide\"" + (this.chk_hidden ? "style=\"display: none\"" : "") + " title=\"Hide\"></div>";
        str_comment += "<div class=\"ct-action ct-action_unhide\"" + (this.chk_hidden ? "" : "style=\"display: none\"") + " title=\"Unhide\"></div>";
        str_comment += "<div class=\"ct-action ct-action_pin\"" + (this.chk_pinned ? "style=\"display: none\"" : "") + " title=\"Pin\"></div>";
        str_comment += "<div class=\"ct-action ct-action_unpin\"" + (this.chk_pinned ? "" : "style=\"display: none\"") + " title=\"Unpin\"></div>";
        str_comment += "</div>";
        str_comment += "<img class=\"ct-comment_pic\" src=\"" + this.author_pic + "\">\n";
        str_comment += "<img class=\"ct-service_pic\" src=\"" + this.post.service_pic + "\">\n";
        str_comment += "<div class=\"ct-comment_time\"><a href=\"" + this.url + "\" target=\"_blank\">" + this.published.niceDate() + "</a></div>";
        str_comment += "<b>" + this.author_name + "</b><br>";
        str_comment += "<div class=\"ct-comment_text\">" + this.content + "</div></div>";
        return str_comment;
      };

      this.get_screen_text = function () {
        var str_comment, p;
        str_comment = strip_html(this.content.replace(/<br\s*[\/]?>/gi, "\n"));
        if (str_comment.length > 250) {
          str_comment = str_comment.substring(0, 250);
          p = str_comment.lastIndexOf(" ");
          if (p >= 0) {
            str_comment = str_comment.substring(0, p) + "...";
          } else {
            str_comment = str_comment + "...";
          }
        }
        return this.author_name + ":\n" + str_comment;
      };

      this.recolor = function (useColor) {
        var style = "ct-background-" + this.post.color;
        $("#" + this.comment_id).removeClass("ct-background-0");
        $("#" + this.comment_id).removeClass(style);
        if (useColor) {
          $("#" + this.comment_id).addClass(style);
        } else {
          $("#" + this.comment_id).addClass("ct-background-0");
        }
      };
    }

    function remove_comment(id) {
      global.setTimeout(function () {
        $("#" + id).fadeOut(1000, function () {
          $("#" + id).remove();
        });
      }, 5000);
    }


    function find_before(c) {
      var i, l, before;
      before = -1;
      l = comments.length;
      for (i = l - 1; i >= 0; i--) {
        if (comments[i].chk_pinned === c.chk_pinned && comments[i].comment_id !== c.comment_id) {
          if (comments[i].published.getTime() <= c.published.getTime()) {
            before = i;
            break;
          }
        }
      }
      return before;
    }

    function move_comment(comment) {
      var div_id, before;
      div_id = "#" + comment.comment_id;
      if ($(div_id) && $(div_id).length > 0) {
        before = find_before(comment);
        if (oldest_first) {
          if (before >= 0 && $("#" + comments[before].comment_id).length > 0) {
            $("#" + comments[before].comment_id).after($(div_id));
          } else {
            if (comment.chk_pinned) {
              $("#ct-comments_pinned").prepend($(div_id));
            } else {
              $("#ct-comments_unpinned").prepend($(div_id));
            }
          }
        } else {
          if (before >= 0 && $("#" + comments[before].comment_id).length > 0) {
            $("#" + comments[before].comment_id).before($(div_id));
          } else {
            if (comment.chk_pinned) {
              $("#ct-comments_pinned").append($(div_id));
            } else {
              $("#ct-comments_unpinned").append($(div_id));
            }
          }
        }
      }
    }

    function create_comment_actions(comment) {
      var div_id;
      div_id = "#" + comment.comment_id;
      $(div_id + " a").prop("target", "_blank");
      if (comment.post.post_type === PLUS_SEARCH || comment.post.post_type === PLUS_STREAM || comment.post.post_type === PLUS_COMMUNITY) {
        $(div_id + " .ct-action_track").click(function () {
          add_post(comment.activity_id);
          $(div_id + " .ct-action_track").hide();
        });
      }
      $(div_id + " .ct-action_pin").click(function () {
        comment.chk_pinned = true;
        $(div_id).addClass("ct-important");
        $(div_id + " .ct-action_pin").hide();
        $(div_id + " .ct-action_unpin").show();
        move_comment(comment);
      });
      $(div_id + " .ct-action_unpin").click(function () {
        comment.chk_pinned = false;
        $(div_id).removeClass("ct-important");
        $(div_id + " .ct-action_unpin").hide();
        $(div_id + " .ct-action_pin").show();
        move_comment(comment);
      });
      $(div_id + " .ct-action_hide").click(function () {
        comment.chk_hidden = true;
        $(div_id).addClass("ct-hidden");
        $(div_id + " .ct-action_hide").hide();
        $(div_id + " .ct-action_unhide").show();
        if (show_hidden) {
          $(div_id).show();
        } else {
          $(div_id).hide();
        }
      });
      $(div_id + " .ct-action_unhide").click(function () {
        comment.chk_hidden = false;
        $(div_id).removeClass("ct-hidden");
        $(div_id + " .ct-action_hide").show();
        $(div_id + " .ct-action_unhide").hide();
        $(div_id).show();
      });
      $(div_id + " .ct-action_watch").click(function () {
        textScreen.show(comment.get_screen_text());
        $(".ct-action_watch").show();
        $(".ct-action_unwatch").hide();
        $(div_id + " .ct-action_watch").hide();
        $(div_id + " .ct-action_unwatch").show();
        $("#ct-hide_overlay").show();
        global.gapi.hangout.av.setLocalParticipantVideoMirrored(false);
      });
      $(div_id + " .ct-action_unwatch").click(function () {
        textScreen.hide();
        $(div_id + " .ct-action_watch").show();
        $(div_id + " .ct-action_unwatch").hide();
        $("#ct-hide_overlay").hide();
        global.gapi.hangout.av.setLocalParticipantVideoMirrored(true);
      });
    }

    function comments_ready(c) {
      var i, l, i1, l1, chk_found, before;
      l = c.length;
      for (i = 0; i < l; i++) {
        chk_found = false;
        l1 = comments.length;
        for (i1 = 0; i1 < l1; i1++) {
          if (comments[i1].comment_id === c[i].comment_id) {
            chk_found = true;
            break;
          }
        }
        if (!chk_found) {
          before = find_before(c[i]);
          if (oldest_first) {
            if (before >= 0 && $("#" + comments[before].comment_id).length > 0) {
              $("#" + comments[before].comment_id).after(c[i].get_contents());
            } else {
              if (c[i].chk_pinned) {
                $("#ct-comments_pinned").prepend(c[i].get_contents());
              } else {
                $("#ct-comments_unpinned").prepend(c[i].get_contents());
              }
            }
          } else {
            if (before >= 0 && $("#" + comments[before].comment_id).length > 0) {
              $("#" + comments[before].comment_id).before(c[i].get_contents());
            } else {
              if (c[i].chk_pinned) {
                $("#ct-comments_pinned").append(c[i].get_contents());
              } else {
                $("#ct-comments_unpinned").append(c[i].get_contents());
              }
            }
          }
          create_comment_actions(c[i]);
          comments.push(c[i]);
          comments.sort(comment_sort);
          if (!$("#ct-stream-menu").hasClass("ct-selected")) {
            $("#ct-stream-menu").addClass("ct-highlight");
          }
        } else {
          if (c[i].chk_updated) {
            $("#" + c[i].comment_id + " > .ct-comment_time > a").html(c[i].updated.niceDate());
            $("#" + c[i].comment_id + " > .ct-comment_time").addClass("ct-comment_updated");
            $("#" + c[i].comment_id + " > .ct-comment_text").html(c[i].content);
            c[i].chk_updated = false;
          }
          if (c[i].chk_delete && !c[i].chk_deleted) {
            c[i].chk_deleted = true;
            $("#" + c[i].comment_id).css("background", "#DDD");
            $("#" + c[i].comment_id).addClass("ct-comment_deleted");
            remove_comment(c[i].comment_id);
          }
        }
      }
    }

    function update_tracking_url() {
      var i, l = posts.length, query = "";
      for (i = 0; i < l; i++) {
        if (i > 0) {
          query += "&";
        }
        switch (posts[i].post_type) {
        case PLUS_POST:
          query += "post=" + posts[i].activity_id;
          break;
        case YT_POST:
          query += "yt=" + posts[i].activity_id;
          break;
        case TWITTER_WIDGET:
          query += "twitter=" + encodeURIComponent(posts[i].activity_id);
          break;
        case PLUS_SEARCH:
          query += "gsearch=" + encodeURIComponent(posts[i].activity_id);
          break;
        case PLUS_STREAM:
          query += "person=" + posts[i].activity_id;
          break;
        case PLUS_COMMUNITY:
          query += "community=" + posts[i].activity_id;
          break;
        }
      }
      if (query !== "") {
        query = "?" + query;
      }
      $("#ct-tracking_url").attr("href", tracker_url + query);
    }

    function show_hide_shares() {
      var i, l, i1, l1, chk_show;
      l = shared_posts.length;
      l1 = posts.length;
      for (i = 0; i < l; i++) {
        chk_show = true;
        if (show_hidden_shares === false && shared_posts[i].chk_hidden) {
          chk_show = false;
        }
        if (chk_show) {
          for (i1 = 0; i1 < l1; i1++) {
            if (shared_posts[i].post_type === posts[i1].post_type && shared_posts[i].activity_id === posts[i1].activity_id) {
              chk_show = false;
              break;
            }
          }
        }
        if (chk_show) {
          $("#s_" + shared_posts[i].div_id).show();
        } else {
          $("#s_" + shared_posts[i].div_id).hide();
        }
      }
    }

    function create_post_actions(post) {
      var div_id;
      if (post.chk_shared) {
        div_id = "#s_" + post.div_id;
        $(div_id + " a").prop("target", "_blank");
        $(div_id + " .ct-action_hide").click(function () {
          post.chk_hidden = true;
          $(div_id).addClass("ct-hidden");
          $(div_id + " .ct-action_hide").hide();
          $(div_id + " .ct-action_unhide").show();
          show_hide_shares();
        });
        $(div_id + " .ct-action_unhide").click(function () {
          post.chk_hidden = false;
          $(div_id).removeClass("ct-hidden");
          $(div_id + " .ct-action_hide").show();
          $(div_id + " .ct-action_unhide").hide();
          show_hide_shares();
        });
        $(div_id + " .ct-action_add").click(function () {
          post.chk_hidden = false;
          $(div_id).removeClass("ct-hidden");
          $(div_id + " .ct-action_hide").show();
          $(div_id + " .ct-action_unhide").hide();
          switch (post.post_type) {
          case PLUS_POST:
            add_post(post.activity_id, false);
            break;
          case TWITTER_WIDGET:
            add_url("https://twitter.com/settings/widgets/" + post.activity_id, false);
            break;
          case PLUS_SEARCH:
            search(PLUS_SEARCH, post.activity_id, false);
            break;
          case YT_POST:
            add_url("http://youtu.be/" + post.activity_id, false);
            break;
          case PLUS_STREAM:
          case PLUS_COMMUNITY:
            add_url(post.url, false);
            break;
          }
          show_hide_shares();
        });
      } else {
        div_id = "#" + post.div_id;
        if (post.post_type === PLUS_POST) {
          $(div_id + " .ct-action_reshares").click(function () {
            post.check_reshares();
          });
        }
        $(div_id + " .ct-action_hide").click(function () {
          var i, l, i1, l1, c;
          l = posts.length;
          for (i = 0; i < l; i++) {
            if (posts[i].post_user === post.post_user && posts[i].post_id === post.post_id) {
              $("#" + posts[i].div_id).remove();
              c = posts[i].get_comments();
              l1 = c.length;
              for (i1 = 0; i1 < l1; i1++) {
                $("#" + c[i1].comment_id).remove();
              }
              i1 = 0;
              while (i1 < comments.length) {
                if (comments[i1].post.post_id === posts[i].post_id && comments[i1].post.post_user === posts[i].post_user) {
                  comments.splice(i1, 1);
                } else {
                  i1++;
                }
              }
              color_count[posts[i].color]--;
              posts.splice(i, 1);
              update_tracking_url();
              show_hide_shares();
              break;
            }
          }
        });
      }
    }

    function post_ready(post_user, post_id, chk_shared) {
      var i, l, chk_all_done, posts_array;
      posts_array = (chk_shared ? shared_posts : posts);
      l = posts_array.length;
      chk_all_done = true;
      for (i = 0; i < l; i++) {
        if (posts_array[i].post_user === post_user && posts_array[i].post_id === post_id) {
          if (posts_array[i].chk_delete) {
            if (!chk_shared) { color_count[posts_array[i].color]--; }
            posts_array.splice(i, 1);
          } else {
            $(chk_shared ? "#ct-shared" : "#ct-posts").prepend(posts_array[i].get_contents());
            create_post_actions(posts_array[i]);
            if (!chk_shared && posts_array[i].valid && posts_array[i].ready && !posts_array[i].checking) {
              posts_array[i].check_comments(comments_ready);
              if (!$("#ct-sources-menu").hasClass("ct-selected")) {
                $("#ct-sources-menu").addClass("ct-highlight");
              }
            }
          }
          break;
        }
      }
      l = posts.length;
      chk_all_done = true;
      for (i = 0; i < l; i++) {
        if (!posts[i].ready) {
          chk_all_done = false;
        }
      }
      if (chk_all_done) {
        $("#ct-searching").hide();
      }
      update_tracking_url();
      show_hide_shares();
    }

    function Post(post_type, post_user, post_id, color, cb, chk_reshare, chk_shared) {
      var org_author, contents, author_name, author_pic, author_link, published, request, this_post, comments, max_results;
      this.post_type = post_type;
      this.ready = false;
      this.valid = false;
      this.checking = false;
      this.chk_delete = false;
      this.color = color;
      this.url = "";
      this.activity_id = "";
      this.org_id = "";
      this.post_user = post_user;
      this.post_id = post_id;
      this.chk_shared = chk_shared;
      this.chk_hidden = false;
      contents = "";
      author_name = "";
      author_pic = imgUrl + "noimage.png";
      author_link = "";
      published = null;
      this_post = this;
      comments = [];
      switch (this.post_type) {
      case PLUS_POST:
        this.service_pic = imgUrl + "comment.png";
        max_results = 100;
        break;
      case YT_POST:
        this.service_pic = imgUrl + "youtube.png";
        max_results = 50;
        break;
      case PLUS_SEARCH:
        this.service_pic = imgUrl + "gplus.png";
        max_results = 20;
        author_pic = imgUrl + "search.png";
        break;
      case TWITTER_WIDGET:
        this.service_pic = imgUrl + "twitter.png";
        max_results = 20;
        author_pic = imgUrl + "search.png";
        break;
      case PLUS_COMMUNITY:
      case PLUS_STREAM:
        this.service_pic = imgUrl + "gplus.png";
        max_results = 100;
        author_pic = imgUrl + "noimage.png";
        break;
      }

      if (this.post_type === PLUS_SEARCH) {
        this.activity_id = post_id;
        this.post_id = search_id;
        search_id++;
      }
      if (this.post_type === TWITTER_WIDGET) {
        this.activity_id = post_id;
      }
      this.div_id = this.post_user + "_" + this.post_id;
      this.div_id = this.div_id.replace(/\W/gi, "_");

      if (this.post_type === TWITTER_WIDGET) {
        global.twitterFetcher.fetch(this.activity_id, "", 1, true, true, true, "", false, function (tweets, data, widgetdata) {
          if (!!widgetdata) {
            contents = widgetdata.title + "<br><br>";
            this_post.url = widgetdata.url;
            this_post.ready = true;
            this_post.valid = true;
          } else {
            contents = "Twitter widget " + this_post.activity_id + " not found.<br><br>";
            this_post.ready = true;
            this_post.valid = false;
          }
          global.setTimeout(function () {
            cb(this_post.post_user, this_post.post_id, chk_shared);
          }, 10);
        });
      }
      if (this.post_type === PLUS_SEARCH) {
        contents = "Google+ search for<br><b>" + this.activity_id + "</b>";
        this.url = "https://plus.google.com/s/" + encodeURIComponent(this.activity_id);
        this.ready = true;
        this.valid = true;
        global.setTimeout(function () {
          cb(this_post.post_user, this_post.post_id, chk_shared);
        }, 10);
      }
      if (this.post_type === PLUS_STREAM) {
        this.activity_id = post_user;
        this.url = "https://plus.google.com/" + post_user + "/posts";
        author_link = this.url;
        request = "https://www.googleapis.com/plus/v1/people/" + this.activity_id + "?callback=?&maxResults=" + max_results + "&key=" + apiKey;
        $.jsonp({
          "url": request,
          "success": function (item) {
            if (!!item.displayName) {
              this_post.activity_id = item.id;
              contents = "Google+ Stream of<br><b>" + item.displayName + "</b>";
              author_name = item.displayName;
              author_pic = item.image.url;
              author_link = item.url;
              this_post.valid = true;
            } else {
              contents = "User " + this_post.activity_id + " not found.";
            }
            this_post.ready = true;
            global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
          },
          "error": function () {
            contents = "User " + this_post.activity_id + " not found.";
            this_post.ready = true;
            global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
          }
        });
      }
      if (this.post_type === PLUS_COMMUNITY) {
        this.activity_id = post_user;
        this.url = "https://plus.google.com/communities/" + post_user;
        author_link = this.url;
        request = "https://www.googleapis.com/plus/v1/people/" + post_user + "/activities/public?callback=?&maxResults=1&key=" + apiKey;
        $.jsonp({
          "url": request,
          "success": function (result) {
            var i;
            if (!!result.items && result.items.length > 0 && !!result.items[0].access && !!result.items[0].access.description) {
              author_name = $.trim(result.items[0].access.description);
              i = author_name.lastIndexOf("(");
              if (i >= 0) {
                author_name = $.trim(author_name.substr(0, i - 1));
              }
              contents = "Google+ Stream of<br><b>" + author_name + "</b>";
              this_post.valid = true;
            } else {
              contents = "Community " + this_post.activity_id + " not found.";
            }
            this_post.ready = true;
            global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
          },
          "error": function () {
            contents = "Community " + this_post.activity_id + " not found.";
            this_post.ready = true;
            global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
          }
        });
      }
      if (this.post_type === PLUS_POST) {
        if (!this.post_user) {
          this.activity_id = post_id;
          request = "https://www.googleapis.com/plus/v1/activities/" + this.activity_id + "?callback=?&key=" + apiKey;
          $.jsonp({
            "url": request,
            "success": function (item) {
              if (item.object) {
                this_post.post_user = item.actor.id;
                this_post.div_id = this_post.post_user + "_" + this_post.post_id;
                this_post.div_id = this_post.div_id.replace(/\W/gi, "_");
                if (item.url.indexOf("plus.google.com") >= 0) {
                  this_post.url = item.url;
                } else {
                  this_post.url = "https://plus.google.com/" + item.url;
                }
                contents = item.title;
                if ($.trim(contents) === "") {
                  contents = "(No post text...)";
                }
                author_name = item.actor.displayName;
                author_pic = item.actor.image.url;
                author_link = item.actor.url;
                published = new Date(item.published);
                this_post.valid = true;
                this_post.org_id = item.object.id || item.id;
                if (item.object.actor) {
                  org_author = item.object.actor.id;
                } else {
                  org_author = item.actor.id;
                }
              } else {
                contents = "Post " + this_post.post_id + " not found.";
              }
              this_post.ready = true;
              global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
            },
            "error": function () {
              contents = "Post " + this_post.post_id + " not found.";
              this_post.ready = true;
              global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
            }
          });
        } else {
          request = "https://www.googleapis.com/plus/v1/people/" + post_user + "/activities/public?callback=?&maxResults=" + max_results + "&key=" + apiKey;
          $.jsonp({
            "url": request,
            "success": function (resp) {
              var i, l, api_url, api_url_parts, item_id, item;
              if (resp.items) {
                l = resp.items.length;
                for (i = 0; i < l; i++) {
                  if (chk_reshare) {
                    if ((resp.items[i].object.id === this_post.post_id) || (!resp.items[i].object.id && (resp.items[i].id === this_post.post_id))) {
                      this_post.activity_id = resp.items[i].id;
                      item_id = i;
                      break;
                    }
                  } else {
                    api_url = resp.items[i].url;
                    api_url_parts = api_url.split("/");
                    if (api_url_parts.length > 0) {
                      if (this_post.post_type === PLUS_POST) {
                        if (api_url_parts[api_url_parts.length - 1] === this_post.post_id) {
                          this_post.activity_id = resp.items[i].id;
                          item_id = i;
                          break;
                        }
                      }
                    }
                  }
                }
                if (this_post.activity_id === "") {
                  if (chk_reshare) {
                    contents = "Reshare by user " + this_post.post_user + " not found.";
                    this_post.chk_delete = true;
                  } else {
                    contents = "Post " + this_post.post_id + " for user " + this_post.post_user + " not found. Please check your Post URL and make sure it's a public post.";
                  }
                } else {
                  item = resp.items[item_id];
                  if (item.url.indexOf("plus.google.com") >= 0) {
                    this_post.url = item.url;
                  } else {
                    this_post.url = "https://plus.google.com/" + item.url;
                  }
                  contents = item.title;
                  if ($.trim(contents) === "") {
                    contents = "(No post text...)";
                  }
                  author_name = item.actor.displayName;
                  author_pic = item.actor.image.url;
                  author_link = item.actor.url;
                  published = new Date(item.published);
                  this_post.valid = true;
                  this_post.org_id = item.object.id || item.id;
                  if (item.object.actor) {
                    org_author = item.object.actor.id;
                  } else {
                    org_author = item.actor.id;
                  }
                }
                this_post.ready = true;
                global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
              } else {
                contents = "No posts found for User ID " + this_post.post_user + "<br>\nPlease check your Post URL and make sure it's a public post.";
                if (resp.error) {
                  contents += "<br>API Error: " + resp.error.message;
                }
                this_post.ready = true;
                if (chk_reshare) {
                  this_post.chk_delete = true;
                }
                global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
              }
            },
            "error": function () {
              contents = "No posts found for User ID " + this_post.post_user + "<br>\nPlease check your Post URL and make sure it's a public post.";
              this_post.ready = true;
              if (chk_reshare) {
                this_post.chk_delete = true;
              }
              global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
            }
          });
        }
      }
      if (this.post_type === YT_POST) {
        request = "https://gdata.youtube.com/feeds/api/videos/" + this.post_id + "?callback=?&alt=json&key=" + ytApiKey;
        $.jsonp({
          "url": request,
          "success": function (data) {
            this_post.chk_complete = true;
            if (data.entry) {
              this_post.activity_id = this_post.post_id;
              this_post.url = "https://www.youtube.com/watch?v=" + this_post.post_id;
              contents = "";
              if (data.entry.title) {
                contents += data.entry.title.$t;
              }
              if (data.entry.content) {
                if (contents !== "") {
                  contents += " - ";
                }
                contents += data.entry.content.$t;
              }
              contents = contents.substring(0, 100) + "<br>";
              author_name = data.entry.author[0].name.$t;
              author_pic = "https://s.ytimg.com/yt/img/creators_corner/YouTube/youtube_32x32.png";
              author_link = data.entry.author[0].uri.$t;
              published = new Date(data.entry.published.$t);
              this_post.valid = true;
            } else {
              contents = "Video ID " + this_post.post_id + " not found.<br>\nPlease check your URL.";
              this_post.valid = false;
            }
            this_post.ready = true;
            global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
          },
          "error": function () {
            this_post.chk_complete = true;
            contents = "Video ID " + this_post.post_id + " not found.<br>\nPlease check your URL.";
            this_post.ready = true;
            this_post.valid = false;
            global.setTimeout(function () { cb(this_post.post_user, this_post.post_id, chk_shared); }, 10);
          }
        });
      }

      this.get_contents = function () {
        var str_tmp = "", style;
        style = "ct-background-" + this_post.color;
        str_tmp += "<div id=\"" + (this_post.chk_shared ? "s_" : "") + this_post.div_id + "\" class=\"ct-post " + style + "\">";
        str_tmp += "<div class=\"ct-actions\">";
        if (this_post.post_type === PLUS_POST) {
          str_tmp += "<div class=\"ct-action ct-action_reshares\"" + (this_post.chk_shared ? " style=\"display: none\"" : "") + " title=\"Check reshares\"></div>";
        }
        str_tmp += "<div class=\"ct-action ct-action_add\"" + (this_post.chk_shared ? "" : " style=\"display: none\"") + " title=\"Add\"></div>";
        str_tmp += "<div class=\"ct-action ct-action_hide\"" + (this_post.chk_shared && this_post.chk_hidden ? " style=\"display: none\"" : "") + " title=\"" + (this_post.chk_shared ? "Hide" : "Remove") + "\"></div>";
        str_tmp += "<div class=\"ct-action ct-action_unhide\"" + (this_post.chk_shared && this_post.chk_hidden ? "" : " style=\"display: none\"") + " title=\"Unhide\"></div>";
        str_tmp += "</div>";
        str_tmp += "<img class=\"ct-post_pic\" src=\"" + author_pic + "\">\n";
        str_tmp += "<img class=\"ct-service_pic\" src=\"" + this_post.service_pic + "\">\n";
        if (this_post.activity_id !== "") {
          switch (this_post.post_type) {
          case TWITTER_WIDGET:
          case PLUS_SEARCH:
            str_tmp += "<div class=\"ct-post_time\"><a href=\"" + this_post.url + "\" target=\"_blank\">Search</a></div>";
            break;
          case PLUS_COMMUNITY:
            str_tmp += "<div class=\"ct-post_time\"><a href=\"" + this_post.url + "\" target=\"_blank\">Community</a></div>";
            break;
          case PLUS_STREAM:
            str_tmp += "<div class=\"ct-post_time\"><a href=\"" + this_post.url + "\" target=\"_blank\">Posts</a></div>";
            break;
          default:
            str_tmp += "<div class=\"ct-post_time\"><a href=\"" + this_post.url + "\" target=\"_blank\">" + published.niceDate() + "</a></div>";
            str_tmp += "<b>" + author_name + "</b><br>";
          }
        }
        str_tmp += "<div class=\"ct-post_text\">" + contents + "</div></div>";
        return str_tmp;
      };

      this.check_reshares = function () {
        var chk_found, l1, i1;
        if (this_post.post_type === PLUS_POST) {
          if (this_post.activity_id !== this_post.org_id) {
            chk_found = false;
            l1 = posts.length;
            for (i1 = 0; i1 < l1; i1++) {
              if (posts[i1].post_user === org_author && posts[i1].activity_id === this_post.org_id) {
                chk_found = true;
                break;
              }
            }
            if (!chk_found) {
              add_post(this_post.org_id);
            }
          }

          request = "https://www.googleapis.com/plus/v1/activities/" + this.activity_id + "/people/resharers?callback=?&maxResults=100&key=" + apiKey;
          $.jsonp({
            "url": request,
            "success": function (resp) {
              var i, l, item, post, chk_found, l1, i1, col, min_col;
              if (resp.items) {
                l = resp.items.length;
                for (i = 0; i < l; i++) {
                  item = resp.items[i];
                  chk_found = false;
                  l1 = posts.length;
                  if (this_post.post_user === item.id) {
                    chk_found = true;
                  }

                  for (i1 = 0; i1 < l1; i1++) {
                    if (posts[i1].post_user === item.id && posts[i1].org_id === this_post.org_id) {
                      chk_found = true;
                      break;
                    }
                  }

                  if (!chk_found) {
                    $("#ct-searching").show();
                    min_col = Math.floor(posts.length / 10);
                    l1 = color_count.length;
                    col = 0;
                    for (i1 = 0; i1 < l1; i1++) {
                      if (color_count[i1] <= min_col) {
                        col = i1;
                        break;
                      }
                    }
                    post = new Post(PLUS_POST, item.id, this_post.org_id, col, post_ready, true);
                    color_count[col]++;
                    posts.push(post);
                  }
                }
              }
            },
            "error": function () {}
          });
        }
      };

      this.check_comments = function (cb) {
        var request;
        if (this_post.activity_id !== "") {
          if (this.post_type === PLUS_SEARCH) {
            this.checking = true;
            request = "https://www.googleapis.com/plus/v1/activities?query=" + encodeURIComponent(this.activity_id) + "&callback=?&orderBy=recent&maxResults=20&key=" + apiKey;
            $.jsonp({
              "url": request,
              "success": function (resp) {
                var i, i1, l, l1, id, chk_new, item;
                if (resp.items) {
                  l1 = comments.length;
                  for (i1 = 0; i1 < l1; i1++) {
                    comments[i1].chk_found = false;
                  }
                  l = resp.items.length;
                  for (i = 0; i < l; i++) {
                    item = resp.items[i];
                    chk_new = true;
                    l1 = comments.length;
                    id = this_post.div_id + "_" + item.id;
                    id = id.replace(/\W/gi, "_");
                    for (i1 = 0; i1 < l1; i1++) {
                      if (comments[i1].comment_id === id) {
                        comments[i1].chk_found = true;
                        if (comments[i1].updated.getTime() !== (new Date(item.updated)).getTime()) {
                          comments[i1].updated = new Date(item.updated);
                          comments[i1].content = item.title + "<br>";
                          comments[i1].chk_updated = true;
                        }
                        chk_new = false;
                        break;
                      }
                    }
                    if (chk_new) {
                      if (item.url.indexOf("plus.google.com") < 0) {
                        item.url = "https://plus.google.com/" + item.url;
                      }
                      comments.push(new Comment(this_post, id, item.actor.displayName, item.actor.image.url, new Date(item.published), new Date(item.updated), item.title + "<br>", item.url, item.id));
                    }
                  }
                }
                comments.sort(comment_sort);
                global.setTimeout(function () {
                  cb(comments);
                }, 10);
                this_post.checking = false;
              },
              "error": function () {
                this_post.checking = false;
              }
            });
          }

          if (this.post_type === PLUS_STREAM || this.post_type === PLUS_COMMUNITY) {
            this.checking = true;
            request = "https://www.googleapis.com/plus/v1/people/" + this.activity_id + "/activities/public?callback=?&maxResults=100&key=" + apiKey;
            $.jsonp({
              "url": request,
              "success": function (resp) {
                var i, i1, l, l1, id, chk_new, item;
                if (resp.items) {
                  l1 = comments.length;
                  for (i1 = 0; i1 < l1; i1++) {
                    comments[i1].chk_found = false;
                  }
                  l = resp.items.length;
                  for (i = 0; i < l; i++) {
                    item = resp.items[i];
                    chk_new = true;
                    l1 = comments.length;
                    id = this_post.div_id + "_" + item.id;
                    id = id.replace(/\W/gi, "_");
                    for (i1 = 0; i1 < l1; i1++) {
                      if (comments[i1].comment_id === id) {
                        comments[i1].chk_found = true;
                        if (comments[i1].updated.getTime() !== (new Date(item.updated)).getTime()) {
                          comments[i1].updated = new Date(item.updated);
                          comments[i1].content = item.title + "<br>";
                          comments[i1].chk_updated = true;
                        }
                        chk_new = false;
                        break;
                      }
                    }
                    if (chk_new) {
                      if (item.url.indexOf("plus.google.com") < 0) {
                        item.url = "https://plus.google.com/" + item.url;
                      }
                      comments.push(new Comment(this_post, id, item.actor.displayName, item.actor.image.url, new Date(item.published), new Date(item.updated), item.title + "<br>", item.url, item.id));
                    }
                  }
                }
                comments.sort(comment_sort);
                global.setTimeout(function () {
                  cb(comments);
                }, 10);
                this_post.checking = false;
              },
              "error": function () {
                this_post.checking = false;
              }
            });
          }

          if (this.post_type === TWITTER_WIDGET) {
            global.twitterFetcher.fetch(this_post.activity_id, "", 20, true, true, true, "", false, function (tweets, data, widgetdata) {
              var i, i1, l, l1, id, chk_new, item;
              if (!!data) {
                l1 = comments.length;
                for (i1 = 0; i1 < l1; i1++) {
                  comments[i1].chk_found = false;
                }
                l = data.length;
                for (i = 0; i < l; i++) {
                  item = data[i];
                  chk_new = true;
                  l1 = comments.length;
                  id = this_post.div_id + "_" + item.id;
                  id = id.replace(/\W/gi, "_");
                  for (i1 = 0; i1 < l1; i1++) {
                    if (comments[i1].comment_id === id) {
                      comments[i1].chk_found = true;
                      chk_new = false;
                      break;
                    }
                  }
                  if (chk_new) {
                    comments.push(new Comment(this_post, id, item.author.nickname + " (" + item.author.name + ")", item.author.image, item.datetime, item.datetime, item.tweet, item.url, item.id));
                  }
                }
              }
              comments.sort(comment_sort);
              this_post.checking = false;
              global.setTimeout(function () {
                cb(comments);
              }, 10);
            });
          }

          if (this.post_type === PLUS_POST) {
            this.checking = true;
            request = "https://www.googleapis.com/plus/v1/activities/" + this_post.activity_id + "/comments?callback=?&sortOrder=descending&maxResults=500&key=" + apiKey;
            $.jsonp({
              "url": request,
              "success": function (resp) {
                var i, i1, l, l1, chk_new, item;
                l1 = comments.length;
                for (i1 = 0; i1 < l1; i1++) {
                  comments[i1].chk_found = false;
                }
                if (resp.items) {
                  l = resp.items.length;
                  for (i = 0; i < l; i++) {
                    item = resp.items[i];
                    chk_new = true;
                    l1 = comments.length;
                    item.id = item.id.replace(/\W/gi, "_");
                    for (i1 = 0; i1 < l1; i1++) {
                      if (comments[i1].comment_id === item.id) {
                        comments[i1].chk_found = true;
                        if (comments[i1].updated.getTime() !== (new Date(item.updated)).getTime()) {
                          comments[i1].updated = new Date(item.updated);
                          comments[i1].content = item.object.content;
                          comments[i1].chk_updated = true;
                        }
                        chk_new = false;
                        break;
                      }
                    }
                    if (chk_new) {
                      comments.push(new Comment(this_post, item.id, item.actor.displayName, item.actor.image.url, new Date(item.published), new Date(item.updated), item.object.content));
                    }
                  }
                }
                comments.sort(comment_sort);
                l1 = comments.length;
                for (i1 = Math.max(l1 - max_results, 0); i1 < l1; i1++) {
                  if (!comments[i1].chk_found) {
                    comments[i1].chk_delete = true;
                  }
                }
                global.setTimeout(function () { cb(comments); }, 10);
                this_post.checking = false;
              },
              "error": function () {
                this_post.checking = false;
              }
            });
          }

          if (this.post_type === YT_POST) {
            this.checking = true;
            request = "https://gdata.youtube.com/feeds/api/videos/" + this.post_id + "/comments?callback=?&alt=json&max-results=" + max_results + "&key=" + ytApiKey;
            $.jsonp({
              "url": request,
              "success": function (data) {
                var i, i1, l, l1, chk_new, item, id, numResults;
                l1 = comments.length;
                for (i1 = 0; i1 < l1; i1++) {
                  comments[i1].chk_found = false;
                }
                numResults = 0;
                if (data.feed.entry) {
                  l = data.feed.entry.length;
                  numResults = l;
                  for (i = 0; i < l; i++) {
                    item = data.feed.entry[i];
                    chk_new = true;
                    l1 = comments.length;
                    id = item.id.$t.replace(/\W/gi, "_");
                    for (i1 = 0; i1 < l1; i1++) {
                      if (comments[i1].comment_id === id) {
                        comments[i1].chk_found = true;
                        if (comments[i1].updated.getTime() !== (new Date(item.updated.$t)).getTime()) {
                          comments[i1].updated = new Date(item.updated.$t);
                          comments[i1].content = item.content.$t;
                          comments[i1].chk_updated = true;
                        }
                        chk_new = false;
                        break;
                      }
                    }
                    if (chk_new) {
                      comments.push(new Comment(this_post, id, item.author[0].name.$t, "https://s.ytimg.com/yt/img/creators_corner/YouTube/youtube_32x32.png", new Date(item.published.$t), new Date(item.updated.$t), item.content.$t));
                    }
                  }
                }
                comments.sort(comment_sort);
                l1 = comments.length;
                for (i1 = Math.max(l1 - numResults, 0); i1 < l1; i1++) {
                  if (!comments[i1].chk_found) {
                    comments[i1].chk_delete = true;
                  }
                }
                global.setTimeout(function () { cb(comments); }, 10);
                this_post.checking = false;
              },
              "error": function () {
                this_post.checking = false;
              }
            });
          }
        }
      };

      this.get_comments = function () {
        return comments;
      };
    }

    add_post = function (activity_id, chk_shared) {
      var i, l, chk_found, post, min_col, col, posts_array;
      posts_array = (chk_shared ? shared_posts : posts);
      chk_found = false;
      l = posts_array.length;
      for (i = 0; i < l; i++) {
        if (posts_array[i].activity_id === activity_id) {
          chk_found = true;
          break;
        }
      }
      if (!chk_found) {
        if (chk_shared) {
          col = 0;
        } else {
          $("#ct-searching").show();
          min_col = Math.floor(posts_array.length / 10);
          l = color_count.length;
          col = 0;
          for (i = 0; i < l; i++) {
            if (color_count[i] <= min_col) {
              col = i;
              break;
            }
          }
          color_count[col]++;
        }
        post = new Post(PLUS_POST, "", activity_id, col, post_ready, false, chk_shared);
        posts_array.push(post);
      }
    };

    function check_comments() {
      var i, l;
      l = posts.length;
      for (i = 0; i < l; i++) {
        if (posts[i].valid && posts[i].ready && !posts[i].checking) {
          posts[i].check_comments(comments_ready);
        }
      }
    }

    function parse_url(query) {
      var q, param, query_string;
      query_string = query.split("&");
      for (q = 0; q < query_string.length; q++) {
        if (query_string[q]) {
          param = query_string[q].split("=");
          if (param.length === 2) {
            param[1] = decodeURIComponent(param[1].replace(/\+/g, " "));
            switch (param[0].toUpperCase()) {
            case "POST":
              add_post(param[1]);
              break;
            case "URL":
              add_url(param[1]);
              break;
            case "TWITTER":
              add_url("https://twitter.com/settings/widgets/" + param[1]);
              break;
            case "GSEARCH":
              search(PLUS_SEARCH, param[1]);
              break;
            case "YT":
              add_url("http://youtu.be/" + param[1]);
              break;
            case "PERSON":
              add_url("https://plus.google.com/" + param[1]);
              break;
            case "COMMUNITY":
              add_url("https://plus.google.com/communities/" + param[1]);
              break;
            }
          }
        }
      }
    }

    function search_gplus() {
      search(PLUS_SEARCH);
    }

    add_url = function (url, chk_shared) {
      var i, l, chk_found, post, min_col, col, url_parts, post_user, post_id, posts_array;
      posts_array = (chk_shared ? shared_posts : posts);
      $("#warning").hide();
      if (!url || typeof url !== "string") {
        url = $.trim($("#ct-post_url").val());
      }
      if (url.toLowerCase().indexOf("allmyplus.com") >= 0) {
        i = url.toLowerCase().indexOf("?");
        if (i >= 0) {
          url = url.substr(i + 1);
          parse_url(url);
        }
        $("#ct-post_url").val("");
        return;
      }
      if (url.toLowerCase().indexOf("twitter.com/settings/widgets") >= 0) {
        url = url.split("?")[0];
        url_parts = url.split("/");
        i = url_parts.indexOf("widgets") + 1;
        if (i < url_parts.length) {
          $("#ct-post_url").val("");
          post_id = url_parts[i];
          chk_found = false;
          l = posts_array.length;
          for (i = 0; i < l; i++) {
            if (posts_array[i].post_user === "TW" && posts_array[i].post_id === post_id) {
              chk_found = true;
              break;
            }
          }
          if (!chk_found) {
            if (chk_shared) {
              col = 0;
            } else {
              $("#ct-searching").show();
              min_col = Math.floor(posts_array.length / 10);
              l = color_count.length;
              col = 0;
              for (i = 0; i < l; i++) {
                if (color_count[i] <= min_col) {
                  col = i;
                  break;
                }
              }
              color_count[col]++;
            }
            post = new Post(TWITTER_WIDGET, "TW", post_id, col, post_ready, false, chk_shared);
            posts_array.push(post);
          }
        } else {
          $("#ct-warning").show();
        }
        return;
      }
      if (url.toLowerCase().indexOf("youtube.com") >= 0 || url.toLowerCase().indexOf("youtu.be") >= 0) {
        post_id = "";
        i = url.toLowerCase().indexOf("?v=");
        if (i >= 0) {
          $("#ct-post_url").val("");
          post_id = url.substr(i + 3);
        }
        if (post_id === "") {
          i = url.toLowerCase().indexOf("youtu.be/");
          if (i >= 0) {
            $("#ct-post_url").val("");
            post_id = url.substr(i + 9);
          }
        }
        if (post_id === "") {
          i = url.toLowerCase().indexOf("/embed/");
          if (i >= 0) {
            $("#ct-post_url").val("");
            post_id = url.substr(i + 7);
          }
        }
        if (post_id !== "") {
          i = post_id.indexOf("&");
          if (i >= 0) {
            post_id = post_id.substring(0, i);
          }
          i = post_id.indexOf("#");
          if (i >= 0) {
            post_id = post_id.substring(0, i);
          }
          i = post_id.indexOf("/");
          if (i >= 0) {
            post_id = post_id.substring(0, i);
          }
          i = post_id.indexOf('"');
          if (i >= 0) {
            post_id = post_id.substring(0, i);
          }
          i = post_id.indexOf("'");
          if (i >= 0) {
            post_id = post_id.substring(0, i);
          }
          chk_found = false;
          l = posts_array.length;
          for (i = 0; i < l; i++) {
            if (posts_array[i].post_user === "YT" && posts_array[i].post_id === post_id) {
              chk_found = true;
              break;
            }
          }
          if (!chk_found) {
            if (chk_shared) {
              col = 0;
            } else {
              $("#ct-searching").show();
              min_col = Math.floor(posts_array.length / 10);
              l = color_count.length;
              col = 0;
              for (i = 0; i < l; i++) {
                if (color_count[i] <= min_col) {
                  col = i;
                  break;
                }
              }
              color_count[col]++;
            }
            post = new Post(YT_POST, "YT", post_id, col, post_ready, false, chk_shared);
            posts_array.push(post);
          }
        } else {
          $("#ct-warning").show();
        }
        return;
      }
      if (url.toLowerCase().indexOf("plus.google.com") >= 0) {
        url = url.split("?")[0];
        url_parts = url.split("/");
        l = url_parts.length;
        if (url_parts[l - 2] === "posts" && l >= 3) {
          $("#ct-post_url").val("");
          post_user = url_parts[l - 3];
          post_id = url_parts[l - 1];

          chk_found = false;
          l = posts_array.length;
          for (i = 0; i < l; i++) {
            if (posts_array[i].post_user === post_user && posts_array[i].post_id === post_id) {
              chk_found = true;
              break;
            }
          }
          if (!chk_found) {
            if (chk_shared) {
              col = 0;
            } else {
              $("#ct-searching").show();
              min_col = Math.floor(posts_array.length / 10);
              l = color_count.length;
              col = 0;
              for (i = 0; i < l; i++) {
                if (color_count[i] <= min_col) {
                  col = i;
                  break;
                }
              }
              color_count[col]++;
            }
            post = new Post(PLUS_POST, post_user, post_id, col, post_ready, false, chk_shared);
            posts_array.push(post);
          }
          return;
        }

        i = url_parts.indexOf("communities");
        if (i >= 0) {
          post_user = url_parts[i + 1];
          if (!!post_user) {
            $("#ct-post_url").val("");
            post_id = "ALL";
            chk_found = false;
            l = posts_array.length;
            for (i = 0; i < l; i++) {
              if (posts_array[i].post_user === post_user && posts_array[i].post_id === post_id) {
                chk_found = true;
                break;
              }
            }
            if (!chk_found) {
              $("#ct-searching").show();
              if (chk_shared) {
                col = 0;
              } else {
                $("#ct-searching").show();
                min_col = Math.floor(posts_array.length / 10);
                l = color_count.length;
                col = 0;
                for (i = 0; i < l; i++) {
                  if (color_count[i] <= min_col) {
                    col = i;
                    break;
                  }
                }
                color_count[col]++;
              }
              post = new Post(PLUS_COMMUNITY, post_user, post_id, col, post_ready, false, chk_shared);
              posts_array.push(post);
            }
            return;
          }
        } else {
          l = url_parts.length;
          post_user = "";
          for (i = 0; i < l; i++) {
            if (!!url_parts[i].match(/[0-9]{10,}/) || !!url_parts[i].match(/\+(\w)+/)) {
              post_user = url_parts[i];
            }
          }
          if (!!post_user) {
            $("#ct-post_url").val("");
            post_id = "ALL";
            chk_found = false;
            l = posts_array.length;
            for (i = 0; i < l; i++) {
              if (posts_array[i].post_user === post_user && posts_array[i].post_id === post_id) {
                chk_found = true;
                break;
              }
            }
            if (!chk_found) {
              $("#ct-searching").show();
              if (chk_shared) {
                col = 0;
              } else {
                $("#ct-searching").show();
                min_col = Math.floor(posts_array.length / 10);
                l = color_count.length;
                col = 0;
                for (i = 0; i < l; i++) {
                  if (color_count[i] <= min_col) {
                    col = i;
                    break;
                  }
                }
                color_count[col]++;
              }
              post = new Post(PLUS_STREAM, post_user, post_id, col, post_ready, false, chk_shared);
              posts_array.push(post);
            }
            return;
          }
        }
        $("#ct-warning").show();
        return;
      }

      search_gplus();
    };

    search = function (t, term, chk_shared) {
      var i, l, chk_found, post, min_col, col, post_user, post_id, posts_array;
      posts_array = (chk_shared ? shared_posts : posts);
      if (t !== PLUS_SEARCH) {
        return;
      }
      $("#ct-warning").hide();
      term = term || $.trim($("#ct-post_url").val());
      $("#ct-post_url").val("");
      if (term && term !== "") {
        switch (t) {
        case PLUS_SEARCH:
          post_user = "PS";
          break;
        }
        post_id = term;
        chk_found = false;
        l = posts_array.length;
        for (i = 0; i < l; i++) {
          if (posts_array[i].post_user === post_user && posts_array[i].activity_id === post_id) {
            chk_found = true;
            break;
          }
        }
        if (!chk_found) {
          if (chk_shared) {
            col = 0;
          } else {
            $("#ct-searching").show();
            min_col = Math.floor(posts_array.length / 10);
            l = color_count.length;
            col = 0;
            for (i = 0; i < l; i++) {
              if (color_count[i] <= min_col) {
                col = i;
                break;
              }
            }
            color_count[col]++;
          }
          post = new Post(t, post_user, post_id, col, post_ready, false, chk_shared);
          posts_array.push(post);
        }
      }
    };

    function switch_tab(div) {
      $(".ct-tab").hide();
      $(".ct-menu").removeClass("ct-selected");
      $(div).show();
      $(div + "-menu").addClass("ct-selected");
      $(div + "-menu").removeClass("ct-highlight");
    }

    function resort_comments() {
      var i, l, new_comments;
      l = comments.length;
      new_comments = [];
      for (i = 0; i < l; i++) {
        if (!comments[i].chk_deleted) {
          new_comments.push(comments[i]);
        }
      }
      new_comments.sort(comment_sort);
      comments.length = 0;
      $("#ct-comments_pinned").html("");
      $("#ct-comments_unpinned").html("");
      comments_ready(new_comments);
      if (!show_hidden) {
        $(".ct-comment.ct-hidden").hide();
      }
    }

    function recolor_comments() {
      var i, l;
      l = comments.length;
      for (i = 0; i < l; i++) {
        if (!comments[i].chk_deleted) {
          comments[i].recolor(use_colors);
        }
      }
    }

    function adjust_sizes() {
      var contentsHeight = $(parentDiv).height() - 32;
      $(".ct-tab").height(contentsHeight + "px");
    }

    function check_video_id() {
      var id, new_state = {};
      video_id = global.gapi.hangout.onair.getYouTubeLiveId();
      if (video_id) {
        add_url("http://youtu.be/" + video_id);
        id = YT_POST + "_" + video_id;
        new_state[id] = "1";
        global.gapi.hangout.data.submitDelta(new_state, []);
      }
    }

    function share_sources() {
      var i, l, new_state = {}, state, id, count;
      l = posts.length;
      count = 0;
      state = global.gapi.hangout.data.getState();
      for (i = 0; i < l; i++) {
        if (posts[i].valid && posts[i].ready) {
          id = posts[i].post_type + "_" + posts[i].activity_id;
          if (!state[id]) {
            new_state[id] = "1";
            count++;
          }
        }
      }
      global.gapi.hangout.data.submitDelta(new_state, []);
      if (count > 0) {
        $("#ct-shares_added").html(count + " new " + (count === 1 ? " source has" : " sources have") + " been added.");
        $("#ct-shares_added").show();
        global.setTimeout(function () {
          $("#ct-shares_added").fadeOut(1000);
        }, 2000);
      } else {
        $("#ct-shares_added").html("No new sources available.");
        $("#ct-shares_added").show();
        global.setTimeout(function () {
          $("#ct-shares_added").fadeOut(1000);
        }, 1000);
      }
    }

    function update_shared(eventObj) {
      var item, state, post_type, activity_id, chk_items;
      if (eventObj && eventObj.state) {
        state = eventObj.state;
      } else {
        state = global.gapi.hangout.data.getState();
      }
      chk_items = false;
      for (item in state) {
        if (state.hasOwnProperty(item)) {
          if (state[item] === "1") {
            if (item.substr(1, 1) === "_") {
              post_type = parseInt(item.substr(0, 1), 10);
              activity_id = item.substr(2);
              switch (post_type) {
              case PLUS_POST:
                add_post(activity_id, true);
                break;
              case TWITTER_WIDGET:
                add_url("https://twitter.com/settings/widgets/" + activity_id, true);
                break;
              case PLUS_SEARCH:
                search(PLUS_SEARCH, activity_id, true);
                break;
              case YT_POST:
                add_url("http://youtu.be/" + activity_id, true);
                break;
              case PLUS_STREAM:
                add_url("https://plus.google.com/" + activity_id, true);
                break;
              case PLUS_COMMUNITY:
                add_url("https://plus.google.com/communities/" + activity_id, true);
                break;
              }
              if (video_id) {
                if (activity_id !== video_id && post_type !== YT_POST) {
                  chk_items = true;
                }
              } else {
                chk_items = true;
              }
            }
          }
        }
      }
      if (chk_items) {
        if (!$("#ct-share-menu").hasClass("ct-selected")) {
          $("#ct-share-menu").addClass("ct-highlight");
        }
      }
    }

    function add_all_shares() {
      var i, l, post;
      l = shared_posts.length;
      for (i = 0; i < l; i++) {
        post = shared_posts[i];
        if (!post.chk_hidden) {
          switch (post.post_type) {
          case PLUS_POST:
            add_post(post.activity_id, false);
            break;
          case TWITTER_WIDGET:
            add_url("https://twitter.com/settings/widgets/" + post.activity_id, false);
            break;
          case PLUS_SEARCH:
            search(PLUS_SEARCH, post.activity_id, false);
            break;
          case YT_POST:
            add_url("http://youtu.be/" + post.activity_id, false);
            break;
          case PLUS_STREAM:
          case PLUS_COMMUNITY:
            add_url(post.url, false);
            break;
          }
        }
      }
      switch_tab("#ct-sources");
    }

    function initializeApp() {
      $(parentDiv).css("padding", 0);
      $(parentDiv).css("overflow-x", "hidden");
      $(parentDiv).css("overflow-y", "hidden");
      $(parentDiv).addClass("ct");
      $(parentDiv).html(
        '<div id="ct-menu"><ul>' +
          ' <li class="ct-menu" id="ct-sources-menu">Sources</li>' +
          ' <li class="ct-menu" id="ct-stream-menu">Stream</li>' +
          ' <li class="ct-menu" id="ct-share-menu">Shared</li>' +
          ' <li class="ct-menu" id="ct-info-menu">?</li></ul>' +
          ' <div id="ct-menu_actions">' +
          ' <div id="ct-hide_overlay" class="ct-action ct-action_unwatch" title="Hide overlay" style="display: none"></div>' +
          ' <a class="ct-action ct-action_tracker" href="http://www.allmyplus.com/comment-tracker/app.html" target="_blank" id="ct-tracking_url" title="Stand-alone Tracker"></a>' +
          ' </div></div>' +
          ' <div id="ct-sources" class="ct-tab">' +
          ' <div class="ct-header">' +
          ' <input id="ct-post_url" name="ct-post_url" style="width: 200px;" placeholder="Google+ / YouTube link or Search term">' +
          ' <button id="ct-add_url">Add</button>' +
          ' </div>' +
          ' <div id="ct-warning" style="display: none;">Not a valid URL... Please try again.</div>' +
          ' <div id="ct-searching" style="display: none;"><img src="' + imgUrl + 'spinner.gif" alt="searching" style="border: 0;"> Searching...</div>' +
          ' <div id="ct-posts"></div>' +
          ' </div>' +
          ' <div id="ct-stream" class="ct-tab">' +
          ' <div class="ct-header">' +
          ' Show hidden <input type="checkbox" id="ct-show_hidden">' +
          ' Oldest first <input type="checkbox" id="ct-oldest_first">' +
          ' Colours <input type="checkbox" id="ct-use_colors" checked="checked">' +
          ' </div>' +
          ' <div id="ct-comments">' +
          ' <div id="ct-comments_pinned"></div>' +
          ' <div id="ct-comments_unpinned"></div>' +
          ' </div>' +
          ' </div>' +
          ' <div id="ct-share" class="ct-tab">' +
          ' <div class="ct-header">' +
          ' <button id="ct-share_sources">Share Sources</button> <button id="ct-add_all">Add All</button> Show hidden <input type="checkbox" id="ct-show_hidden_shares">' +
          ' <div id="ct-shares_added" style="display: none;">Your sources have been added</div>' +
          ' </div>' +
          ' <div id="ct-shared"></div>' +
          ' </div>' +
          ' <div id="ct-info" class="ct-tab">' +
          ' <img src="' + imgUrl + 'comment-tracker.png" alt="Hangout Comment Tracker" style="vertical-align: middle;"> <b>Hangout Comment Tracker</b><br><br>' +
          ' <p class="ct-small">' +
          ' Information: <a href="http://www.allmyplus.com/comment-tracker/" target="_blank">Website</a> / <a href="http://www.allmyplus.com/comment-tracker/tos.html" target="_blank">TOS</a> / <a href="http://www.allmyplus.com/comment-tracker/privacy.html" target="_blank">Privacy Policy</a><br><br>' +
          ' Developer: <a href="https://plus.google.com/112336147904981294875" target="_blank">Gerwin Sturm</a> / <a href="http://www.foldedsoft.at/" target="_blank">FoldedSoft e.U.</a><br><br>' +
          ' TextScreen by: <a href="https://plus.google.com/101852559274654726533" target="_blank">Allen "Prisoner" Firstenberg</a><br><br>' +
          ' Twitter Post Fetcher by: <a href="https://plus.google.com/110804953626559077511/posts" target="_blank">Jason Mayes</a><br><br>' +
          ' Open Source: <a href="https://github.com/Scarygami/comment_tracker" target="_blank">GitHub</a>' +
          ' </p>' +
          ' </div>'
      );
      textScreen = new global.TextScreen({background: imgUrl + "bg.png"});
      $("#ct-add_url").click(add_url);
      $("#ct-oldest_first").click(function () {
        oldest_first = $("#ct-oldest_first").prop("checked");
        resort_comments();
      });
      $("#ct-use_colors").click(function () {
        use_colors = $("#ct-use_colors").prop("checked");
        recolor_comments();
      });
      $("#ct-show_hidden").click(function () {
        show_hidden = $("#ct-show_hidden").prop("checked");
        if (show_hidden) {
          $(".ct-comment.ct-hidden").show();
        } else {
          $(".ct-comment.ct-hidden").hide();
        }
      });
      $("#ct-show_hidden_shares").click(function () {
        show_hidden_shares = $("#ct-show_hidden_shares").prop("checked");
        show_hide_shares();
      });
      switch_tab("#ct-sources");
      $("#ct-sources-menu").click(function () {
        switch_tab("#ct-sources");
      });
      $("#ct-stream-menu").click(function () {
        switch_tab("#ct-stream");
      });
      $("#ct-share-menu").click(function () {
        switch_tab("#ct-share");
      });
      $("#ct-info-menu").click(function () {
        switch_tab("#ct-info");
      });
      $("#ct-hide_overlay").click(function () {
        textScreen.hide();
        $(".ct-action_unwatch").hide();
        $(".ct-action_watch").show();
        global.gapi.hangout.av.setLocalParticipantVideoMirrored(true);
      });

      $("#ct-share_sources").click(share_sources);
      $("#ct-add_all").click(add_all_shares);

      if (global.gapi.hangout.onair) {
        check_video_id();
        global.gapi.hangout.onair.onYouTubeLiveIdReady.add(check_video_id);
      }
      $(global).resize(adjust_sizes);
      $(parentDiv).resize(adjust_sizes);
      adjust_sizes();
      global.gapi.hangout.data.onStateChanged.add(update_shared);
      update_shared();
      global.setInterval(check_comments, 60000);
    }

    this.init = function (div, url, key, ytkey) {
      parentDiv = div;
      if (parentDiv.charAt(0) !== "#") {
        parentDiv = "#" + parentDiv;
      }
      imgUrl = url;
      if (imgUrl.charAt(imgUrl.length - 1) !== "/") {
        imgUrl += "/";
      }
      apiKey = key;
      ytApiKey = ytkey;
      initializeApp();
    };
  };

  /*********************************************************************
  *  #### Twitter Post Fetcher v9.0 ####
  *  Coded by Jason Mayes 2013. A present to all the developers out there.
  *  www.jasonmayes.com
  *  Please keep this disclaimer with my code if you use it. Thanks. :-)
  *  Got feedback or questions, ask here:
  *  http://www.jasonmayes.com/projects/twitterApi/
  *  Updates will be posted to this site.
  *********************************************************************/
  global.twitterFetcher = function () {
    var domNode = '';
    var maxTweets = 20;
    var parseLinks = true;
    var queue = [];
    var inProgress = false;
    var printTime = true;
    var printUser = true;
    var formatterFunction = null;
    var supportsClassName = true;
    var showRts = true;
    var customCallbackFunction = null;

    function handleTweets(tweets, jsondata, widgetdata){
      if (customCallbackFunction == null) {
        var x = tweets.length;
        var n = 0;
        var element = document.getElementById(domNode);
        var html = '<ul>';
        while(n < x) {
          html += '<li>' + tweets[n] + '</li>';
          n++;
        }
        html += '</ul>';
        element.innerHTML = html;
      } else {
        customCallbackFunction(tweets, jsondata, widgetdata);
      }
    }

    function strip(data) {
      return data.replace(/<b[^>]*>(.*?)<\/b>/gi, function(a,s){return s;})
          .replace(/class=".*?"|data-query-source=".*?"|dir=".*?"|rel=".*?"/gi, '');
    }

    function getElementsByClassName (node, classname) {
      var a = [];
      var regex = new RegExp('(^| )' + classname + '( |$)');
      var elems = node.getElementsByTagName('*');
      for (var i = 0, j = elems.length; i < j; i++) {
          if(regex.test(elems[i].className)){
            a.push(elems[i]);
          }
      }
      return a;
    };

    function parseAuthorData(authorNode) {
      var data = {}, tmp;

      if (supportsClassName) {
        tmp = authorNode.getElementsByClassName('avatar');
      } else {
        tmp = getElementsByClassName(authorNode, 'avatar');
      }
      if (tmp.length > 0) {
        data.image = tmp[0].getAttribute('src');
      }

      if (supportsClassName) {
        tmp = authorNode.getElementsByClassName('p-name');
      } else {
        tmp = getElementsByClassName(authorNode, 'p-name');
      }
      if (tmp.length > 0) {
        if (tmp[0].innerText) {
          data.name = tmp[0].innerText;
        } else {
          data.name = tmp[0].textContent;
        }
      }

      if (supportsClassName) {
        tmp = authorNode.getElementsByClassName('p-nickname');
      } else {
        tmp = getElementsByClassName(authorNode, 'p-nickname');
      }
      if (tmp.length > 0) {
        if (tmp[0].innerText) {
          data.nickname = tmp[0].innerText;
        } else {
          data.nickname = tmp[0].textContent;
        }
      }

      if (data.nickname) {
        data.url = "https://www.twitter.com/" + data.nickname.substring(1);
      }

      return data;
    }

    function parseWidgetData(node) {
      var tmp;
      if (supportsClassName) {
        tmp = node.getElementsByClassName('summary');
      } else {
        tmp = getElementsByClassName(node, 'summary');
      }
      if (tmp.length > 0) {
        tmp = tmp[0].getElementsByTagName('a');
        if (tmp.length > 0) {
          return {'url': tmp[0].href, 'title': tmp[0].getAttribute('title')};
        }
      }
    }

    return {
      fetch: function(id, domId, maxNumberOfTweets, enableLinks, showUser, showTime, dateFunction, showRetweet, customCallback) {
        if (maxNumberOfTweets === undefined) {
          maxNumberOfTweets = 20;
        }
        if (enableLinks === undefined) {
          parseLinks = true;
        }
        if (showUser === undefined) {
          showUser = true;
        }
        if (showTime === undefined) {
          showTime = true;
        }
        if (dateFunction === undefined) {
          dateFunction = 'default';
        }
        if (showRetweet === undefined) {
          showRetweet = true;
        }
        if (customCallback === undefined) {
          customCallback = null;
        }
        if (inProgress) {
          queue.push({"id":id, "domId":domId, "maxTweets":maxNumberOfTweets,
              "enableLinks":enableLinks, "showUser":showUser,
              "showTime":showTime, "dateFunction":dateFunction,
              "showRt":showRetweet, "customCallback":customCallback});
        } else {
          inProgress = true;
          domNode = domId;

          maxTweets = maxNumberOfTweets;
          parseLinks = enableLinks;
          printUser = showUser;
          printTime = showTime;
          showRts = showRetweet;
          formatterFunction = dateFunction;
          customCallbackFunction = customCallback;
          var script = document.createElement('script');
          script.type = 'text/javascript';

          script.src = 'https://cdn.syndication.twimg.com/widgets/timelines/' +
              id + '?&lang=en&callback=twitterFetcher.callback&' +
              'suppress_response_codes=true&rnd=' + Math.random();
          document.getElementsByTagName('head')[0].appendChild(script);
        }
      },

      callback: function(data) {
        var div = document.createElement('div');
        div.innerHTML = data.body;
        if (typeof(div.getElementsByClassName) === 'undefined') {
           supportsClassName = false;
        }

        var json = [];
        var tweets = [];
        var authors = [];
        var times = [];
        var rts = [];
        var x = 0;
        var widgetdata = parseWidgetData(div);

        if (supportsClassName) {
          var tmp = div.getElementsByClassName('tweet');
          while (x < tmp.length) {
            if (tmp[x].getElementsByClassName('retweet-credit').length > 0) {
              rts.push(true);
            } else {
              rts.push(false);
            }
            if (!rts[x] || rts[x] && showRts) {
              tweets.push(tmp[x].getElementsByClassName('e-entry-title')[0]);
              authors.push(tmp[x].getElementsByClassName('p-author')[0]);
              times.push(tmp[x].getElementsByClassName('dt-updated')[0]);
              json.push({'id' : tmp[x].getAttribute('data-tweet-id')});
            }
            x++;
          }
        } else {
          var tmp = getElementsByClassName(div, 'tweet');
          while (x < tmp.length) {
            if (getElementsByClassName(tmp[x], 'retweet-credit').length > 0) {
              rts.push(true);
            } else {
              rts.push(false);
            }
            if (!rts[x] || rts[x] && showRts) {
              tweets.push(getElementsByClassName(tmp[x], 'e-entry-title')[0]);
              authors.push(getElementsByClassName(tmp[x], 'p-author')[0]);
              times.push(getElementsByClassName(tmp[x], 'dt-updated')[0]);
              json.push({'id' : tmp[x].getAttribute('data-tweet-id')});
            }
            x++;
          }
        }

        if (tweets.length > maxTweets) {
          tweets.splice(maxTweets, (tweets.length - maxTweets));
          authors.splice(maxTweets, (authors.length - maxTweets));
          times.splice(maxTweets, (times.length - maxTweets));
          json.splice(maxTweets, (tweets.length - maxTweets));
          rts.splice(maxTweets, (rts.length - maxTweets));
        }

        var arrayTweets = [];
        var x = tweets.length;
        var n = 0;
        while(n < x) {
          var newDate = new Date(times[n].getAttribute('datetime')
              .replace(/-/g,'/').replace('T', ' ').split('+')[0]);
          json[n].datetime = newDate;
          json[n].author = parseAuthorData(authors[n]);
          if (json[n].id && json[n].author.url) {
            json[n].url = json[n].author.url + '/statuses/' + json[n].id;
          }
          if (typeof(formatterFunction) !== 'string') {
            var dateString = formatterFunction(newDate);

            times[n].setAttribute('aria-label', dateString);

            if (tweets[n].innerText) {
              // IE hack.
              if (supportsClassName) {
                times[n].innerText = dateString;
              } else {
                var h = document.createElement('p');
                var t = document.createTextNode(dateString);
                h.appendChild(t);
                h.setAttribute('aria-label', dateString);
                times[n] = h;
              }
            } else {
              times[n].textContent = dateString;
            }
          }
          if (parseLinks) {
            var op = '';
            json[n].tweet = strip(tweets[n].innerHTML);
            if (printUser) {
              op += '<div class="user">' + strip(authors[n].innerHTML) +
                  '</div>';
            }
            op += '<p class="tweet">' + json[n].tweet + '</p>';
            if (printTime) {
              op += '<p class="timePosted">' +
                  times[n].getAttribute('aria-label') + '</p>';
            }
            arrayTweets.push(op);
          } else {
            if (tweets[n].innerText) {
              var op = '';
              json[n].tweet = tweets[n].innerText;
              if (printUser) {
                op += '<p class="user">' + authors[n].innerText + '</p>';
              }
              op += '<p class="tweet">' +  tweets[n].innerText + '</p>';
              if (printTime) {
                op += '<p class="timePosted">' + times[n].innerText + '</p>';
              }
              arrayTweets.push(op);
            } else {
              var op = '';
              json[n].tweet = tweets[n].textContent;
              if (printUser) {
                op += '<p class="user">' + authors[n].textContent + '</p>';
              }
              op += '<p class="tweet">' +  tweets[n].textContent + '</p>';
              if (printTime) {
                op += '<p class="timePosted">' + times[n].textContent + '</p>';
              }
              arrayTweets.push(op);
            }
          }
          n++;
        }
        handleTweets(arrayTweets, json, widgetdata);
        inProgress = false;
        if (queue.length > 0) {
          global.twitterFetcher.fetch(queue[0].id, queue[0].domId, queue[0].maxTweets,
              queue[0].enableLinks, queue[0].showUser, queue[0].showTime,
              queue[0].dateFunction, queue[0].showRt, queue[0].customCallback);
          queue.splice(0,1);
        }
      }
    }
  }();
}(this));