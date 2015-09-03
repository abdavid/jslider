/**
 * Created by davidatborresen on 31.01.14.
 */

/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../definitions/hammer/hammerjs.d.ts" />
/// <reference path="interfaces.d.ts" />
// / <reference path="./Slider.ts" />
/// <reference path="./SliderUXComponent.ts" />

module Slider {

	export class Draggable extends Slider.UXComponent {

		public static EVENT_NAMESPACE:string = '.sliderDraggable';
		public static EVENT_CLICK:string = 'click';
		public static EVENT_UP:string = 'up';
		public static EVENT_MOVE:string = 'move';
		public static EVENT_DOWN:string = 'down';
		public $scope:Slider.Impl;
		private outer:JQuery;
		private defaultIs:IInteractionType = {
			drag: false,
			clicked: false,
			toclick: false,
			mouseup: false
		};
		private is:IInteractionType;
		private events:Object;
		private cursorX:number;
		private cursorY:number;
		private d:Object;

		constructor() {
			super();
		}

		/**
		 * @param config
		 */
		public initialize(config?:Object):void {
			this.is = jQuery.extend(this.is, this.defaultIs);

			this.events = {
				down: 'touch',
				move: 'drag',
				up: 'release',
				click: 'tap'
			};
		}

		/**
		 * @param templateParams
		 * @returns {Draggable}
		 */
		public create(templateParams:Object = {}):Draggable {
			super.create(templateParams);

			this.outer = jQuery('.draggable-outer');

			var offset:IOffset = this.getPointerOffset();

			this.d = {
				left: offset.left,
				top: offset.top,
				width: this.$el.width(),
				height: this.$el.height()
			};

			this.setupEvents();

			return this;
		}

		public getGesture(event:any):any {
			return event.gesture ? event.gesture : event.originalEvent.gesture;
		}

		private setupEvents():void {
			this.bind(jQuery(document), Draggable.EVENT_MOVE, (event:any)=> {
				if (this.is.drag) {
					var gesture = this.getGesture(event);
					gesture.preventDefault();
					gesture.stopPropagation();

					this.mouseMove(event);
				}
			});

			this.bind(jQuery(document), Draggable.EVENT_DOWN, (event:any)=> {
				if (this.is.drag) {
					var gesture = this.getGesture(event);
					gesture.preventDefault();
					gesture.stopPropagation();
				}
			});

			this.bind(this.$el, Draggable.EVENT_MOVE, (event:any)=> {
				if (this.is.drag) {
					var gesture = this.getGesture(event);
					gesture.preventDefault();
					gesture.stopPropagation();

					this.mouseMove(event);
				}
			});

			this.bind(this.$el, Draggable.EVENT_DOWN, (event:any)=> {
				this.mouseDown(event);
			});

			this.bind($("body"), Draggable.EVENT_UP, (event:any)=> {
				this.mouseUp(event);
			});

			this.bind(this.$el, Draggable.EVENT_CLICK, (event:any)=> {
				this.is.clicked = true;

				if (!this.is.toclick) {
					this.is.toclick = true;
				}
			});
		}

		/**
		 * @param event {JQueryEventObject}
		 * @returns {{x: number, y: number}}
		 */
		public getPageCoords(event:any):ICoordinates {
			var touch = this.getGesture(event).touches[0];
			return {
				x: touch.pageX,
				y: touch.pageY
			};
		}

		/**
		 * @returns {{left: number, top: number}}
		 */
		public getPointerOffset():IOffset {
			return this.$el.offset();
		}

		/**
		 * @todo find out why event namespace doesnt work
		 */
		private unbind():void {
			for (var eventType in this.events) {
				var namespacedEvent:string = this.events[eventType]; // + SliderDraggable.EVENT_NAMESPACE
				//jQuery(document).hammer().off(namespacedEvent);
				this.$el.off(namespacedEvent);
			}
		}

		public destroy():void {
			this.unbind();
			super.destroy();
		}

		/**
		 * @param element
		 * @param eventType
		 * @param callback
		 * @todo find out why event namespace doesnt work
		 */
		private bind(element:JQuery, eventType:string, callback:(event:any)=>void):void {
			var namespacedEvent:string = this.events[eventType]; // + SliderDraggable.EVENT_NAMESPACE

			element.on(namespacedEvent, callback);
		}

		/**
		 * @param event {Event}
		 */
		public mouseDown(event:any):void {
			this.is.drag = true;
			this.is.mouseup = this.is.clicked = false;

			var offset:IOffset = this.getPointerOffset(),
				coords:ICoordinates = this.getPageCoords(event);

			this.cursorX = coords.x - offset.left;
			this.cursorY = coords.y - offset.top;

			this.d = jQuery.extend(this.d, {
				left: offset.left,
				top: offset.top,
				width: this.$el.width(),
				height: this.$el.height()
			});


			if (this.outer.length > 0) {
				this.outer.css({
					height: Math.max(this.outer.height(), jQuery(document.body).height()),
					overflow: 'hidden'
				});
			}

			this.onMouseDown(event);
		}

		/**
		 * @param event {MouseEvent}
		 */
		public mouseMove(event:any):void {
			this.is.toclick = false;
			var coords = this.getPageCoords(event);
			this.onMouseMove(event, coords.x - this.cursorX, coords.y - this.cursorY);
		}

		/**
		 * @param event {MouseEvent}
		 */
		public mouseUp(event:any):void {
			if (!this.is.drag) {
				return;
			}

			this.is.drag = false;

			if (this.outer.length > 0 && (navigator.userAgent.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/i.test(navigator.userAgent))) {
				this.outer.css({overflow: 'hidden'});
			}
			else {
				this.outer.css({overflow: 'visible'});
			}

			this.onMouseUp(event);
		}

		/**
		 * @param id
		 * @param constructor
		 */
		public onInit(id:number):void {

		}

		/**
		 * @param event {MouseEvent}
		 */
		public onMouseDown(event:any):void {
			this.css({position: 'absolute'});
		}

		/**
		 * @param event {MouseEvent}
		 * @param x {number}
		 * @param y {number}
		 */
		public onMouseMove(event:any, x:number = null, y:number = null):void {
		}

		/**
		 * @param event {MouseEvent}
		 */
		public onMouseUp(event:any):void {
		}
	}
}
	
