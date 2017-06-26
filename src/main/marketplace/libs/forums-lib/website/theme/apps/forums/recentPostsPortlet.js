
(function(){
    function initPosts(basePath) {
        $.getJSON(basePath + "_postSearch?a", function(response) {
            log("got posts response", response);
            processPosts(response);
        });
    }

    function processPosts(comments) {
        $(".barList").html("");
        if( comments ) {
            if( comments.length > 0 ) {
                comments.sort( dateOrd );
                var cookieAuth = "?miltonUserUrl=" + $.cookie("miltonUserUrl");
                cookieAuth += "&miltonUserUrlHash=" + $.cookie("miltonUserUrlHash");
                for( i=0; i<comments.length; i++ ) {
                    var comment = comments[i];
                    var dt = new Date(comment.date);
                    //var url = "http://" + comment.contentDomain + comment.contentHref + cookieAuth;
                    var url = comment.contentHref;
                    displayPost(comment.user, dt, comment.notes, comment.contentTitle, url); // pageTitle and pagePath are only present for aggregated results
                }
                jQuery(".barList abbr").timeago();
            } else {
                $(".barList").html("<li>No recent posts</li>");
            }
        }
    }

    function displayPost(user, date, comment, pageTitle, pagePath) {
        if( user == null ) {
            log("missing user, ignore");
            return;
        }
        log("user", user);
        var li = $("<li>");
        var manageUserHref = "manageUsers/" + user.userId;
        if( user.photoHash ) {
            li.append("<a class='profilePic' href='" + manageUserHref + "'><img src='/_hashes/files/" + user.photoHash + "' alt='' /></a>");
        } else {
            li.append("<a class='profilePic' href='" + manageUserHref + "'><img src='/templates/apps/user/profile.png' alt='' /></a>");
        }
        li.append(user.name + " posted in <a target='_blank' class='module' href='" + pagePath + "'><span>" + pageTitle + "</span></a>");
        var formattedDate = date.toISOString();
        var commentHtml = "<div class='post'>";
        commentHtml += "<p>" + comment + "</p>";
        commentHtml += "<em><abbr class='timeago' title='" + formattedDate + "'>" + formattedDate + "</abbr></em>";
        commentHtml += "</div>";
        li.append(commentHtml);

        li.append();
        $(".barList").append(li);
    }

    window.initPosts = initPosts;
})(jQuery);