(function(window,$,undefined){

	var opacityEnabled = ( !$.browser.msie || $.browser.version >= 9 );

	$(function(){
		var backdrop = document.createElement('div');
		backdrop.id = 'backdrop';
		$('body').append(backdrop);
		
		$("a.fancybox").fancybox({centerOnScroll:true});

		$(backdrop).click(function(event){
			$('.popup-window').fadeOut('fast');
			$(backdrop).fadeOut('fast');
			return false;
		});

		$("article .top").click(function(event){
			$('body,html').animate({ 'scrollTop' : 0 }, 1000, 'easeInOutExpo' );
			return false;
		});
		
		$("#portfolio").each(function(i,node){
			mwd.initPortfolio(node);
		});

		$('section.twitter').each(function(i,node){
			mwd.initTweetTicker(node);
		});

		$("#slider .inner").nivoSlider({
			effect:'fade',
			directionNav: false,
			controlNav: false,
			slices:1,
			pauseTime: 4000,
			pauseOnHover:false
		});
		$("#newsletter .button").data({active:false});
		
		$("#newsletter form").submit(function(){
			var data = $(this).serialize();
			var form = $(this);
			var message = $(".message",form);
			form.addClass('loading');
			message.removeClass('error notice').html('').hide();;
			$.post('/actions/subscribe.cfm',data,function(data){
				var result = eval('(' + data + ')');
				if ( result.errorcode > 0 ) {
					message.addClass('error').html(result.message).fadeIn(200);
				} else {
					$("input",form).val('');
					message.addClass('notice').html(result.message).fadeIn(200);
				}
				$(this).removeClass('loading');
			});
			return false;
		});
		
		$("#newsletter .button").click(function(){
			var active = $(this).data('active');
			var w = $("#newsletter .wrapper");
			var f = $("#newsletter .subscribe");
			w.stop();
			f.stop();
			if ( active ) {
				w.css({height:w.innerHeight()});
				f.fadeOut(300,function(){
					w.animate({height:0},500,'easeInOutExpo');
				});
			} else {
				w.animate({
					height: 106
				},500,'easeOutExpo',function(){
					w.css('height','auto');
					f.fadeIn(300);
				});
			}
			$(this).toggleClass('active');
			$(this).data('active',!active);
			return false;
		});

		/* hide more text */
		$('.moretext').each(function(i,node){
			$(node).data('_height',$(node).height());
		});
		$('.moretext').css({ 'height':0, 'opacity': 0}).addClass('hide');
		$('nav.share').css({ 'height':0, 'opacity': 0}).addClass('hide');

		if ( $.browser.msie == true && $.browser.version == '7.0' ) {
			$('body > footer, body > footer ul li nav a, section.page article h1, section.news div.list li a.more, section.archive nav a').prepend($('<span/>').addClass('before'));
			$('body > footer, body > footer ul li nav a, section.page article h1, section.news div.list li a.more, section.archive nav a').append($('<span/>').addClass('after'));
		}

		$("#header nav a span").each(function(i,node){
			/* store current width */
			var currentWidth = ( $(node).width() + 5 );
			$(node).data({'currentWidth':currentWidth});
			$(node).width(currentWidth); // prevent clipping during animation - marco
		});
		$("#header nav a span").hover(function(event){
			$(this).stop().animate({width:938});
		},function(event){
			var width = $(this).data('currentWidth');
			$(this).stop().animate({width:width});
		});

	});
	
	var mwd = {
		displayPopup : function(name) {
			var popup = $(document.getElementById(name));
			var backdrop = $(document.getElementById('backdrop'));
			popup.stop();
			backdrop.stop();
			backdrop.fadeIn(350,function(){
				popup.fadeIn(350);
			});
			$('body,html').animate({ 'scrollTop' : 0 }, 800, 'easeInOutExpo' );
		},
		toggleMoreText : function(element,event) {
			var cont = document.getElementById(element);
			var more = $('.moretext',cont);
			$(cont).toggleClass('showMoreText');
			if ( more.hasClass('hide') ) {
				more.removeClass('hide');
				more.stop();
				more.animate({ height: $(more).data('_height') },500,function(){
					if ( !opacityEnabled ) {
						more.css({'opacity':1});
						more.css({'filter':''});
					} else {
						more.css({left: 20 });
						more.animate({opacity: 1, left: 0 },500);
					}
				});
			} else {
				more.addClass('hide');
				more.stop();
				more.animate({opacity: 0,left:20},500,function(){
					more.css({left:0});
					more.animate({ height: 0 },500);
				});
			}
			return false;
		},
		toggleShare : function(element,event) {
			var cont = document.getElementById(element);
			var share = $('nav.share',cont);
			if ( share.hasClass('hide')) {
				share.removeClass('hide');
				share.stop();	
				share.animate({'height':60},200,'linear',function(){
					if ( !opacityEnabled ) {
						share.css({'opacity':1});
						share.css({'filter':''});
					} else {
						share.css({left: 20 });
						share.animate({'opacity':1,'left': [0,'easeOutBounce']},400,'linear');
					}
				});
			} else {
				share.addClass('hide');
				share.stop();	
				share.animate({'opacity':0,'left': 20},400,'linear',function(){
					share.css({left:0});
					share.animate({'height':0},200);
				});
			}
			return false;
		},
		shareOnFacebook : function(element,event) {
			var cont = document.getElementById(element);
			var title = $('h1',cont).html() || document.title;
			var picture = '';
			var caption = $('p:first',cont).text();
			var description = $('p:gt(1)',cont).text();
			
			caption = ( caption.length > 100 ? caption.substring(0,100).concat('…') : caption );
			description = ( description.length > 500 ? description.substring(0,500).concat('…') : description );
			
			$('img',cont).each(function(i,node){
				picture = node.src;
			});
			FB.ui({
				method: 'feed',
				link: document.location.href,
				message: '',
				picture: picture,
				caption: caption,
				description: description,
				name:title});
			_gaq.push(['_trackSocial', 'facebook', 'send', document.location.href]);
			return false;
		},
		shareOnTwitter : function(element,event){
			var cont = document.getElementById(element);
			var title = $('h1',cont).html() || document.title;
			var w = window.open('share?related=metiswebdev&via=metiswebdev&url' + document.location.href + '&text=' + title,'twitter','height=480,width=640,scrollbars=0');
			_gaq.push(['_trackSocial', 'twitter', 'tweet', document.location.href]);
			w.focus();
		},
		initPortfolio: function(portfolio){
			var pager = $('.pager');
			var count = $('ul',pager).size();
			var descriptionBox = document.createElement('div');
			descriptionBox.id = 'portfolio-description';
			descriptionBox.appendChild(document.createElement('section'));
			descriptionBox.appendChild(document.createElement('footer'));
			$('body').append(descriptionBox);

			$("li",portfolio).hover(function(event){
				var pos = $(this).offset();
				var size, top;
				var description = $('.description',this).html() || false;

				$('.title',this).stop().animate({ top:0 },500,'easeOutExpo');
				$('.sub',this).stop().animate({ top:40 },800,'easeOutExpo');

				if ( description ) {
					$('section',descriptionBox).html(description);
					$(descriptionBox).show();
					size = $(descriptionBox).outerHeight();
					top = pos.top - size;
					$(descriptionBox).css({ left: pos.left - 30, top: top });
					$(descriptionBox).css({ opacity:0 }).stop().animate({ top : ( top - 40 ) , opacity:1 },300);
				}
			},function(event){
				var pos = $(descriptionBox).offset();
				$('.title',this).stop().animate({ top:-60 },500,'easeOutExpo');
				$('.sub',this).stop().animate({ top:-60 },300,'easeOutExpo');
				$(descriptionBox).stop().animate({ top : ( pos.top + 40 ) , opacity:0 },300,function(){
					$(this).hide();
				});
			});

			/* init pager */

			pager.width(count * 960);
			$('nav a',portfolio).click(function(){
				if (this.className == 'current')
					return false;
				var page = this.href.split('#')[1] || 1;
				pager.animate({ left: -( (page-1) * 960 ) },1000,'easeInOutExpo');
				$('a.current',portfolio).removeClass('current');
				this.className = 'current';
				return false;
			});
		},
		initTweetTicker : function(element) {
			var timer;
			var timeout = 6000;
			function nextTweet() {
				clearTimeout(timer);
				var current = $('summary.current',element);
				var next = current.next();
				if ( next.size() == 0 )
					next = $('summary:first',element);
				current.stop();
				current.fadeOut(500,function(){
					current.removeClass('current');
				});
				next.stop();
				next.fadeIn(500,function(){
					next.addClass('current');
				});
				timer = setTimeout(nextTweet,timeout);
			}
			timer = setTimeout(nextTweet,timeout);
		}
	}
	
	window.mwd = mwd;
})(window,jQuery);