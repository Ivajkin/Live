var UnitEntity = new Class({
	Extends: UnitTpl,
	initialize: function(options){  
		this.parent(options);  
	},
	createWide: function(params){
		params = !helper.isUndefNull(params)?params:helper.EmptyObject();
		this.unit_type = this.options.wide;
		return this.createUnit(this.options.wide, params);
	},
	createNarrow: function(params){
		params = !helper.isUndefNull(params)?params:helper.EmptyObject();
		this.unit_type = this.options.narrow;
		return this.createUnit(this.options.narrow, params);
	},
	createUnit: function(unit_class, params){
		var html = !helper.isUndefNull(params.html)?params.html:helper.EmptyString();
		var unit = this.unit = new Element('div',{'class':'unit ' + unit_class.name});
		var content = new Element('div',{'class':unit_class.content});
		
		var loader = this.loader =  new Element('img',{'class':'loader','src':this.options.loader,'style':'display:none;'});
		unit.adopt(loader);
		
		var html_content = this.html_content = new Element('div',{'class':'html_content','html':html});	
			
		content.adopt(html_content);
		//left decorator
		var left_decorator = new Element('div',{'class':'left_decorator'});
		var left_row_top = new Element('div',{'class':'row'});
		var left_top_decorator = new Element('div',{'class':'left_top_decorator'});
		left_row_top.adopt(left_top_decorator);
		var left_row_middle = new Element('div',{'class':'row'});
		var left_middle_decorator = new Element('div',{'class':'left_middle_decorator'});
		left_row_middle.adopt(left_middle_decorator);
		var left_row_bottom = new Element('div',{'class':'row'});
		var left_bottom_decorator = new Element('div',{'class':'left_bottom_decorator'});
		left_row_bottom.adopt(left_bottom_decorator);
		//left_decorator.adopt([left_top_decorator,left_middle_decorator,left_bottom_decorator]);
		left_decorator.adopt([left_row_top,left_row_middle,left_row_bottom]);
		//right decorator
		var right_decorator = new Element('div',{'class':'right_decorator'});
		var right_row_top = new Element('div',{'class':'row'});
		var right_top_decorator = new Element('div',{'class':'right_top_decorator'});
		right_row_top.adopt(right_top_decorator);
		var right_row_middle = new Element('div',{'class':'row'});
		var right_middle_decorator = new Element('div',{'class':'right_middle_decorator'});
		right_row_middle.adopt(right_middle_decorator);
		var right_row_bottom = new Element('div',{'class':'row'});
		var right_bottom_decorator = new Element('div',{'class':'right_bottom_decorator'});
		right_row_bottom.adopt(right_bottom_decorator);
		
		//right_decorator.adopt([right_top_decorator,right_middle_decorator,right_bottom_decorator]);
		right_decorator.adopt([right_row_top,right_row_middle,right_row_bottom]);
		unit.adopt([left_decorator,content,right_decorator]);		
				
		//making toolbar
		if(!helper.isUndefNull(params.toolbar)){								
			var icons = !helper.isUndefNull(params.toolbar.icons)?params.toolbar.icons:{left:helper.EmptyArray(),right:helper.EmptyArray()};
			content.grab(this.createToolbar(unit_class,params.toolbar.header,icons),helper.where.top);
		}		
		//making footbar
		if(!helper.isUndefNull(params.footbar)){								
			var icons = !helper.isUndefNull(params.footbar.icons)?params.footbar.icons:{left:helper.EmptyArray(),right:helper.EmptyArray()};
			content.grab(this.createFootbar(unit_class,params.footbar.header,icons),helper.where.bottom);			
		}
		
		return unit;
	}
});
