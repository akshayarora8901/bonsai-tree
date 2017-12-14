(function(window) {
	var DragAndDropPlugin = window.DragAndDropPlugin = function(ul) {
		this.draggedElement = {};
		this.position = null;
		this.element = ul;
		this.element.addEventListener('insertBefore', this.insertBeforeListener.bind(this));
		this.element.addEventListener('prepend', this.prependListener.bind(this));
		this.element.addEventListener('insertAfter', this.insertAfterListener.bind(this));
	};
	DragAndDropPlugin.prototype.element_dragstart = function(data) {
		// data.event.originalEvent.dataTransfer.effectAllowed = 'all';
		// console.log("dragstart>>>>", data.event.originalEvent.srcElement);
		var srcElement$ = $(data.event.originalEvent.srcElement);
		var target$ = srcElement$.hasClass('row') ? srcElement$ : srcElement$.closest('.row');
		// console.log("target$>>>", target$);
		target$.removeClass('highlight1 hightlight2 highlight3');
		target$.addClass("dragged");
		this.draggedElement.data = data.nodeData;
		this.draggedElement.ref = target$;
		var clonedTarget = target$.clone(false, true);
		clonedTarget.attr('id','drag-ghost');
		clonedTarget.removeClass('dragged');
		clonedTarget.css({'position': 'absolute','top': '-1000px','border': '2px dotted #D8ADC2', 'width': '400px'});
		$('ul.tree--layers').append(clonedTarget);
		// console.log("cloned target>>>", clonedTarget);
		data.event.originalEvent.dataTransfer.setDragImage(clonedTarget[0], 100, 10);
    // crt.style.backgroundColor = "red";
	}
	DragAndDropPlugin.prototype.element_drag = function(data) {
		// console.log("drag>>>>", data.event.originalEvent.srcElement);
		if(data.event && data.event.originalEvent) {
			this.draggedElement.clientX = data.event.originalEvent.clientX;
			this.draggedElement.clientY = data.event.originalEvent.clientY;
		}
	}
	DragAndDropPlugin.prototype.element_dragend = function(data) {
		// console.log("Element Dragend Called>>>>", data);
		this.draggedElement.ref.removeClass('dragged');
		$('#drag-ghost').remove();
	}
	DragAndDropPlugin.prototype.element_dragover = function(data) {
		// console.log("dragover>>>>", data.event.originalEvent.srcElement);
		var dragElementPosition = {
			x: this.draggedElement.clientX,
			y: this.draggedElement.clientY
		}
		var srcElement$ = data.event && data.event.originalEvent ? $(data.event.originalEvent.srcElement) : null; 
		var target$ = srcElement$.hasClass('row') ? srcElement$ : srcElement$.closest('.row');
		var dropElementPosition = target$ ? target$.position() : null;
		if(dropElementPosition) {
			dropElementPosition.right = dropElementPosition.left + target$.width();
			dropElementPosition.bottom = dropElementPosition.top + target$.height();
			var position1 = {
				left: dropElementPosition.left,
				right: dropElementPosition.right,
				top: dropElementPosition.top,
				bottom: dropElementPosition.top + (target$.height()/3)
			};
			var position2 = {
				left: dropElementPosition.left,
				right: dropElementPosition.right,
				top: position1.bottom,
				bottom: position1.bottom + (target$.height()/3)
			};
			var position3 = {
				left: dropElementPosition.left,
				right: dropElementPosition.right,
				top: position2.bottom,
				bottom: position2.bottom + (target$.height()/3)
			}
		} 
		var dragDrop = {
			dragElementPosition: dragElementPosition,
			position1: position1,
			position2: position2,
			position3: position3
		}
		this.position = this.checkForPosition(dragDrop);
		// console.log("position>>>>", position)
		var isChild = false;
		if(this.draggedElement.data.id === data.nodeData.id) {
			isChild = true;
		} else if(data.nodeData.runtime.level == 1) {
			isChild = true;
		} else if(this.draggedElement.data && this.draggedElement.data.children && this.draggedElement.data.children.length) {
			isChild = this.checkForChildren(this.draggedElement.data, data.nodeData);
		} else if(data.nodeData.type == 'g' || data.nodeData.id.toLowerCase().indexOf('layer') != -1) {
			isChild = false;
		} else {
			isChild = false;
		}
		// console.log("isChild>>>", isChild);
		if(!isChild) {
			switch(this.position) {
				case 'position1': 
					$('div[cbri-id=layer]').removeClass('highlight1 highlight2 highlight3');
					target$.addClass('highlight1');
					break;
				case 'position2': 
					$('div[cbri-id=layer]').removeClass('highlight1 highlight2 highlight3');
					if((data.nodeData && data.nodeData.children && data.nodeData.children.length) || (data.nodeData.type == 'g' || data.nodeData.id.toLowerCase().indexOf('layer') != -1))
						target$.addClass('highlight2');
					break;
				case 'position3': 
					$('div[cbri-id=layer]').removeClass('highlight1 highlight2 highlight3');
					target$.addClass('highlight3');
					break;
				default: 
					console.log("No action>>>");
			}
		} else {
			$('div[cbri-id=layer]').removeClass('highlight1 highlight2 highlight3 no-drop');
			data.event.originalEvent.dataTransfer.dropEffect = "none";
		}
	}

	DragAndDropPlugin.prototype.element_drop = function(data) {
		// console.log("drop>>>>", data.event.originalEvent.srcElement);
		var srcElement$ = data.event.originalEvent && $(data.event.originalEvent.target);
		var target$ = srcElement$.hasClass('row') ? srcElement$ : srcElement$.closest('.row');
		if(this.position) {
			switch(this.position) {
				case 'position1':
					this.insertBefore(target$, 'highlight1');
					break;
				case 'position2': 
					this.prepend(target$, 'highlight2');
					break;
				case 'position3':
					this.insertAfter(target$, 'highlight3');
					break;
				default:
			}
		}
		$('div[cbri-id=layer]').removeClass('highlight1 highlight2 highlight3');
	}

	DragAndDropPlugin.prototype.dispatchEvent = function(type, detail, bubbles) {
		bubbles = typeof(bubbles) != 'undefined' ? bubbles : true;
		var changeEvent = new CustomEvent(type, {
      detail: detail,
      bubbles: bubbles
    });
    this.element.dispatchEvent(changeEvent);
	}

	DragAndDropPlugin.prototype.insertBeforeListener = function(data) {
		console.log("Insert Before Event Called: ", data);
	}
	DragAndDropPlugin.prototype.prependListener = function(data) {
		console.log("Prepend Event Called: ", data);
	}
	DragAndDropPlugin.prototype.insertAfterListener = function(data) {
		console.log("Insert After Event Called: ", data);
	}

	DragAndDropPlugin.prototype.insertBefore = function(target, className) {
		if(target.hasClass(className)) {
			this.removeData();
			this.addData(target, 'before');
			this.dispatchEvent('insertBefore', { target: target });
		}
	}
	DragAndDropPlugin.prototype.prepend = function(target, className) {
		if(target.hasClass(className)) {
			this.removeData();
			this.addData(target, 'prepend');
			this.dispatchEvent('prepend', { target: target });
		}
	}
	DragAndDropPlugin.prototype.insertAfter = function(target, className) {
		if(target.hasClass(className)) {
			this.removeData();
			this.addData(target, 'after');
			this.dispatchEvent('insertAfter', { target: target });
		}
	}

	DragAndDropPlugin.prototype.removeData = function() {
		var draggedData = this.draggedElement.data;
		// console.log("required li>>>", this.draggedElement.ref.closest('ul').closest('li'));
		var parentData = this.draggedElement.ref.closest('ul').closest('li').data('data');
		parentData.children = parentData.children.filter(function(elem) {
			return elem.id != draggedData.id;
		});
		this.draggedElement.ref.closest('ul').closest('li').data('data', parentData);
	}
	DragAndDropPlugin.prototype.addData = function(target, position) {
		var draggedData = this.draggedElement.data;
		var parentData = target.closest('ul').closest('li').data('data');
		var targetParentData = target.closest('li').data('data');
		var parentIndex = parentData.children.findIndex(function(elem, index, array) {
			return elem.id === targetParentData.id;
		});
		switch(position) {
			case 'before': 
				if(parentIndex != -1){
					draggedData.runtime.level = parentData.runtime.level + 1;
					parentData.children.splice(parentIndex, 0, draggedData);
				}	
				break;
			case 'prepend':
				draggedData.runtime.level = targetParentData.runtime.level + 1;
				targetParentData.children.unshift(draggedData);
				break;
			case 'after':
				if(parentIndex != -1) {
					draggedData.runtime.level = parentData.runtime.level + 1;
					parentData.children.splice(parentIndex+1, 0, draggedData);
				}
				break;
			default:
		}
		if(draggedData.children && draggedData.children.length) {
			var parentLevel = draggedData.runtime.level;
			draggedData.children = draggedData.children.filter(function(elem) {
				elem.runtime.level = parentLevel + 1;
				return true;
			});
		}
	}

	DragAndDropPlugin.prototype.checkForChildren = function(dragElementData, dropElementData) {
		var that = this;
		var isChild = dragElementData.children.filter(function(elem) {
			return elem.id === dropElementData.id;
		});
		if(isChild && isChild.length) {
			return true;
		} else {
			isChild = dragElementData.children.filter(function(elem) {
				if(elem.children && elem.children.length)
					return that.checkForChildren(elem, dropElementData);
				else
					return false;
			});
			if(isChild && isChild.length)
				return true;
			else 
				return false;
		}	
	}

	DragAndDropPlugin.prototype.checkForPosition = function(positions) {
		var position = null;
		let dragElementPosition = positions.dragElementPosition;
		if((dragElementPosition.y >= positions.position1.top && dragElementPosition.y <= positions.position1.bottom) && (dragElementPosition.x >= positions.position1.left && dragElementPosition.x <= positions.position1.right)) {
			position = "position1";
		} else if((dragElementPosition.y >= positions.position2.top && dragElementPosition.y <= positions.position2.bottom) && (dragElementPosition.x >= positions.position2.left && dragElementPosition.x <= positions.position2.right)) {
			position = "position2";
		} else if((dragElementPosition.y >= positions.position3.top && dragElementPosition.y <= positions.position3.bottom) && (dragElementPosition.x >= positions.position3.left && dragElementPosition.x <= positions.position3.right)) {
			position = "position3";
		}
		return position;
	}
})(window);