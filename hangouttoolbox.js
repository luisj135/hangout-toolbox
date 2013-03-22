 (function(){
 	/*
	 * @copyright
	 * Hangout Toolbox for Google+ Hangouts
	 * Copyright (c) 2012 Moritz Tolxdorff & Martin Thielecke
	 * 
	 * Hangout Toolbox for Google+ Hangouts is free software: you can redistribute it and/or modify
 	 * it under the terms of the GNU General Public License as published by
 	 * the Free Software Foundation, either version 3 of the License, or
 	 * (at your option) any later version.
	 * 
	 * Hangout Toolbox for Google+ Hangouts is distributed in the hope that it will be useful,
 	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 	 * GNU General Public License for more details.
 	 * 
 	 * You should have received a copy of the GNU General Public License
 	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 *
	*/	

	/**
	 * @HangoutToolbox
	 * @constructor
	*/
	function HangoutToolbox(){
		if(!gapi){
			throw "gapi not loaded!";
		}

		/**
		 * @MemeFace.maxHeight - defines the maximum window height
		 * @public
		 * @const 
		 * @type {Number}
		*/
        if(window.innerHeight > 0) {
		  this.maxHeight = window.innerHeight;
        } else {
		  this.maxHeight = $(window).height();
        }

		/*
		 * Bind gapi events when API is ready
		*/
		gapi.hangout.onApiReady.add(this.onApiReady.bind(this));

		/*
		 * Bind window events when window size has changed
		*/
		jQuery(window).resize(this.onWindowResize.bind(this));
	}

	/**
	 * @onWindowResize - Fired when window resizes
	 * @private
	 * @param evt {jQueryEventObject}
	*/
	HangoutToolbox.prototype.onWindowResize = function(evt){
		//console.log("Window resized: " + this.maxHeight + " px");
		this.scale();
	}

	/**
	 * @buildDOM - Building the DOM structure
	 * @private
	*/
	HangoutToolbox.prototype.buildDOM = function(){
		/*
		 * Create empty elements
		*/
		var div = this.createElement("div");
		var span = this.createElement("span");
		var cleardiv = this.createElement("div", {"class": "clear"});

		/*
		 * Create pane header
		*/
		var header = this.createElement("div", {"id": "header"});
		header.append(this.createElement("span", {"class": "header-icon"}));
		header.append(this.createElement("span", {"class": "header-title"}).html("Hangout Toolbox"));
		
		/*
		 * Create pane mainbody
		*/
		//var mainbody = div.clone().attr({"id": "mainbody"}).css({"height": (this.maxHeight-57)+"px"});
		var mainbody = div.clone().attr({"id": "mainbody"}).css({"height": (this.maxHeight-166)+"px"});

		/*
		 * Create Accordion
		*/
		var tabs = div.clone().attr({"id":"tabs"});
		var tabs_ul = this.createElement("ul");
		tabs_ul.append(this.createElement("li").html("<a href='#tabs-1' title='Lower Third' class='lowerthird'></a>"));
		tabs_ul.append(this.createElement("li").html("<a href='#tabs-2' title='Volumecontrol' class='volume'></a>"));
		tabs_ul.append(this.createElement("li").html("<a href='#tabs-3' title='De-Face' class='deface'></a>"));
		tabs_ul.append(this.createElement("li").html("<a href='#tabs-4' title='Soundboard' class='soundboard'></a>"));
		tabs_ul.append(this.createElement("li").html("<a href='#tabs-7' title='Comment Tracker' class='commenttracker'></a>"));
		tabs_ul.append(this.createElement("li").html("<a href='#tabs-6' title='Info & Support' class='infosupport'></a>"));
		tabs.append(tabs_ul);
		
		tabs.append(div.clone().attr({"id":"tabs-1", "class":"app"}));
		tabs.append(div.clone().attr({"id":"tabs-2", "class":"app"})); 
		tabs.append(div.clone().attr({"id":"tabs-3", "class":"app"}));
		tabs.append(div.clone().attr({"id":"tabs-4", "class":"app"}));
		tabs.append(div.clone().attr({"id":"tabs-7", "class":"app"}));
		tabs.append(div.clone().attr({"id":"tabs-6", "class":"app"}).html("<p style='margin-left:10px;'>A Hangout Extension with several features.<br /><br />This toolbox provides several apps/extensions to improve your Hangout experience.<br /><br />It contains:<br /><ul style='margin-left:10px;'><li>Lower Third</li><li>Volume Control</li><li>Meme-Faces</li><li>Soundboard</li><li>Comment Tracker</li></ul><p style='margin-left: 10px;'>Please visit us on <a href='https://plus.google.com/110344475746210074770/about' target='_blank'>Google+</a> or on our <a href='https://code.google.com/p/hangout-toolbox/' target='_blank'>project page</a><br />Thanks to <a href='https://plus.google.com/112336147904981294875/posts' target='_blank'>Gerwin Sturm</a> for the Comment Tracker code.</p>"));

		/*
		 * Create the footer Div
		*/
		var date = new Date();
		year = date.getFullYear();
		var footer = div.clone().attr({id: "footer"}).html("&copy " + year + " ");
		footer.append(this.createElement("a",{"href": "https://google.me/+MoritzTolxdorff", "target": "_blank"}).html("Moritz"));
		footer.append(this.createElement("span").html(" &amp; "));
		footer.append(this.createElement("a",{"href": "https://plus.google.com/104514437420477125478", "target": "_blank"}).html("Martin"));
		footer.append(this.createElement("span", {"class":"version"}).text("v " + version));
		
		mainbody.append(tabs);

		/*
		 * Append DOM structure to container
		*/
		jQuery("#extension").append(header, mainbody, footer);
	}

	/**
	 * @scale - Scales the mainbody for different resolutions
	 * @public
	*/
	HangoutToolbox.prototype.scale = function(){
		/*
		 * Set the maximum height of the mainbody minus header, input div and footer
		*/
		jQuery("#mainbody").height(this.maxHeight-57);
		jQuery("#tabs").height(this.maxHeight-63);
		jQuery(".app").height(this.maxHeight-102);
	}

	/**
	 * @createElement - Creates a new element
	 * @public
	 * @param type {String} 
	 * @param attr {Object} 
	*/
	HangoutToolbox.prototype.createElement = function(type, attr){
		return jQuery("<" + type + ">").attr(attr || {});
	}

	/**
	 * @onApiReady - Fired by gapi when it's ready
	 * @private
	 * @param event {gapi.hangout.apiReadyEvent}
	*/
	HangoutToolbox.prototype.onApiReady = function(event){
		if(event.isApiReady){
			try {
				console.log("Hangout Toolbox loaded!");
				this.buildDOM();
				$("#accordion").accordion({
					collapsible: true,
					autoHeight: false,
					active: false
				});
				$("#tabs").tabs({
            		collapsible: true,
            		selected: 5
       			});
				this.scale();
				
				var lowerthird = new LowerThird();
				lowerthird.init();
				var volumecontrol = new VolumeControl();
				volumecontrol.init();
				var memeface = new MemeFace();
				memeface.init();
				var soundboard = new Soundboard();
				soundboard.init();

				var imgUrl = "https://mthangout.appspot.com/a/hangouttoolbox/i";
          		var apiKey = "AIzaSyD1t60BBZsM2ow9swI23XTDSPNlPsuW9os";
          		var ytApiKey = "AI39si5JHqCi4KasYbc85RYMCbIkPVxsyuPtX1-KKwW1msZ5Shk0MRppSZWsAjQAlwd3G23YivyaEQMhCuz1KciQNiCOCvUP-Q";

          		var commentTracker = new CommentTracker();
          		commentTracker.init("tabs-7", imgUrl, apiKey, ytApiKey);
			}	
			catch(err) {
				console.log(err);
			}
		}
	}

	// Export instantiated HangoutToolBox to main window
	window["appController"] = new HangoutToolbox();
})()
