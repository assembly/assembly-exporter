///////////////////////////////////////////////////////
//    AssemblyExporter.jsx
//    (c) 2012 Sophia Chou, Assembly Development Corp.
///////////////////////////////////////////////////////

var doc = app.activeDocument;

//
// Utils
//

var Utils = {};

Utils.stringTimes = function(str,times) {
	return _.map(_.range(times),function(){return str}).join('')
}

Utils.setItemVisibility = function(itemObject,answer) {
	if (itemObject.typename == "GroupItem") {
		try {
			itemObject.hidden = !answer;
		} catch (e) {
			$.writeln("Couldn't modifying group.\n", e);
		}
	} else if (itemObject.typename == "Layer") {
		itemObject.visible = answer;
	}
}

Utils.geometricBoundsOfLayer = function(layer) {
	var x0,y0,x1,y1 = null;
	var len = layer.pageItems.length;
	for (var i = 0; i < len; i++) {
		var gb = layer.pageItems[i].geometricBounds;
		if ((x0 == null) || (gb[0] < x0))
			x0 = gb[0];
		if ((y0 == null) || (gb[1] > y0))
			y0 = gb[1];
		if ((x1 == null) || (gb[2] > x1))
			x1 = gb[2];
		if ((y1 == null) || (gb[3] < y1))
			y1 = gb[3];
	}
	return [x0,y0,x1,y1];
}

Utils.isLayerInArtboard = function(layer,artboard) {
	var layer_gb = this.geometricBoundsOfLayer(layer);
	if (layer_gb == [null,null,null,null])
		return false;
	var artboard_gb = artboard.artboardRect;

	if ( ((layer_gb[0] <= artboard_gb[0]) && (layer_gb[2] >= artboard_gb[0])) || ((layer_gb[0] >= artboard_gb[0]) && (layer_gb[0] <= artboard_gb[2])) ) {
		if ( ((layer_gb[1] <= artboard_gb[1]) && (layer_gb[1] >= artboard_gb[3])) || ((layer_gb[1] >= artboard_gb[1]) && (layer_gb[3] <= artboard_gb[1])) ) {
			return true;
		}
	}
	return false;
}

var AE = {};

AE.modes = [
	{
		name: "all_artboards",
		label: "All Artboards",
		description: """Exports all artboards, plain and simple.

Exported filenames won't include the $ or any #hash or -dash tags."""

	},{
		name: "moneyboards",
		label: "Moneyboards",
		description: """Exports all artboards prefaced with $ (for example $HomePage).

Moneyboard are an easy way for you to designate and mass export full mockups while ignoring asset artboards.

They're called moneyboard because they're the ones that wow the clients and get you paid."""
	},{
		name: "tagged_artboards",
		label: "Tagged Artboards",
		description: """Exports artboards while hiding all layers and groups without a matching tag. 

#hash tags: An artboard "logo #fg" hides all layers and groups, except those tagged with #fg. Exports to "logo.png".

-dash tags: An artboard "logo #fg -active -inactive" does the same, but individually exports "logo-active.png" using -active content and "logo-inactive.png" using -inactive content.

Moneyboards are ignored."""
	}
]

//
// Prefs
//

AE.INFO_LAYER_NAME = '__AssemblyExporter__';

AE.info_layer = null;

AE.pref_xml = null;

AE.prefs = {
	prefix: null,
	suffix: null,
	base_path: null,
	transparency: false,
	format: null,
	mode: null
}

AE.prefs_default = {
	prefix: "",
	suffix: "",
	transparency: true,
	base_path: "~/Desktop",
	scaling: "100%",
	format: "PNG 24",
	mode: "tagged_artboards"
}

AE.initPrefs = function() {
	var parse_success = false;
	var delete_message =  "Please delete the "+this.INFO_LAYER_NAME+" layer and try again.";

	try {
		this.info_layer = doc.layers.getByName(this.INFO_LAYER_NAME);
	} catch (e) {
		this.info_layer = doc.layers.add();
		this.info_layer.name = this.INFO_LAYER_NAME;
		var info_xml = this.info_layer.textFrames.add();
		var saved_data = new XML( '<prefs></prefs>' );
		saved_data.appendChild( new XML('<prefix></prefix>') );
		saved_data.appendChild( new XML('<suffix></suffix>') );
		saved_data.appendChild( new XML('<base_path>'+this.prefs_default.base_path+'</base_path>') );
		saved_data.appendChild( new XML('<scaling>'+this.prefs_default.scaling+'</scaling>') );
		saved_data.appendChild( new XML('<transparency>'+this.prefs_default.transparency+'</transparency>') );
		saved_data.appendChild( new XML('<format>'+this.prefs_default.format+'</format>') );
		saved_data.appendChild( new XML('<mode>'+this.prefs_default.mode+'</mode>') );
		info_xml.contents = saved_data.toXMLString();
		this.info_layer.printable = false;
		this.info_layer.visible = false;
		this.info_layer.opacity = 0;
	}

	// get xml out of the 1 text item on that layer and parse it
	if ( this.info_layer.textFrames.length != 1 ) {
		Window.alert(delete_message);
	} else {
		try {    
			this.prefs_xml = new XML( this.info_layer.textFrames[0].contents );
			this.prefs.prefix = this.prefs_xml.prefix;
			this.prefs.suffix = this.prefs_xml.suffix;
			this.prefs.base_path = this.prefs_xml.base_path;    
			this.prefs.transparency = this.prefs_xml.transparency == "true" ? true : false;
			this.prefs.format = this.prefs_xml.format;
			this.prefs.mode = this.prefs_xml.mode;
			if ( ! this.prefs_xml.scaling || this.prefs_xml.scaling == "" ) {
				this.prefs.scaling = this.prefs_default.scaling;
			} else {
				this.prefs.scaling		= this.prefs_xml.scaling;
			}
			parse_success = true;
		} catch ( e ) {
			Window.alert(delete_message);
		}
	}
	return parse_success;
}

//
//  Doc Layer and Group Tree
//

AE.object2id = function(obj) {
	r = [];

	while (obj != doc) {
		//r.push(obj.name);
		var parent = obj.parent;
		var siblings;
		if (obj.typename == "GroupItem") {
			r.push("g");
			siblings = parent.groupItems;
		} else if (obj.typename == "Layer") {
			r.push("l");
			siblings = parent.layers;
		}
		for (i = 0; i<siblings.length; i++) {
			if (siblings[i] == obj) {
				r.push(i);
				break;
			}
		}
		obj = parent;
	}

	return r;
}

AE.setDocLayerGroupTreeDefaults = function() {
	AE.docLayerGroupTree = { "children": [] };
	AE.docLayerObjectIndex = {};
	AE.docGroupObjectIndex = {};
	AE.docLayerTreeIndex = {};
	AE.docGroupTreeIndex = {};
}

AE.docItemToTreeItem = function(item,type,id,parent) {
	if (parent == null) {
		parent = {};
	}
	if (parent.hash_tags == null)
		parent.hash_tags = [];

	var dash_tag = AE.firstDashTag(item.name);

	var r = {"children": []}
	r.type = type
	r.id = id;
	r.name = item.name;
	if (item.typename == "GroupItem") {
		r.initially_visible = !item.hidden;
	} else if (item.typename == "Layer") {
		r.initially_visible = item.visible; 
	}
	r.hash_tags = _.union(parent.hash_tags,AE.nameHashTags(item.name));
	r.dash_tag = dash_tag ? dash_tag : parent.dash_tag;
	r.bubbled_hash_tags = r.hash_tags;
	r.bubbled_dash_tags = r.dash_tag ? [r.dash_tag] : [];

	if (r.hash_tags.length) {
		parent.bubbled_hash_tags = _.union(r.hash_tags,parent.bubbled_hash_tags);
	}
	if (r.dash_tag) {
		parent.bubbled_dash_tags = _.union([r.dash_tag],parent.bubbled_dash_tags);
	}
	return r;
}

AE.createTreeForLayers = function(layers,parent_path) {
	if (!parent_path) { parent_path = []; }
	var untreed_layer_ids = [];
	for (i = 0; i < layers.length; i++) {
		var path = parent_path.concat(i);
		AE.docLayerObjectIndex[AE.object2id(layers[i])] = path;
		untreed_layer_ids.push(i);
	}
	while (untreed_layer_ids.length != 0) {
		var marked_for_removal = [];
		for (ii = 0; ii < untreed_layer_ids.length; ii++) {
			var i = untreed_layer_ids[ii];
			var path = parent_path.concat(i);
			var layer = layers[i];
			var tree_parent_index;
			if (layer.parent == doc) {
				tree_parent_index = [];
			} else if (AE.docLayerTreeIndex[AE.docLayerObjectIndex[AE.object2id(layer.parent)]]) {
				tree_parent_index = AE.docLayerTreeIndex[AE.docLayerObjectIndex[AE.object2id(layer.parent)]];
			}
			if (tree_parent_index) {
				// add layer to subtree
				var tree_parent = AE.docLayerGroupItemFromIndex(tree_parent_index);
				var tree_parent_children = tree_parent['children'];
				tree_parent_children.push(AE.docItemToTreeItem(layer, "layer", path, tree_parent));
				// set layer tree index
				tree_index = tree_parent_index.concat(tree_parent_children.length-1);
				AE.docLayerTreeIndex[path] = tree_index;
				// mark for removal from  untreed_layer_ids 
				marked_for_removal.push(ii);
			}
		}
		untreed_layer_ids = _.difference(untreed_layer_ids, marked_for_removal);
	}
	for (i = 0; i < layers.length; i++) {
		if (layers[i].layers.length > 0) {
			AE.createTreeForLayers(layers[i].layers,parent_path.concat(i)); 
		}
	}
}

AE.createTreeForGroups = function() {
	var untreed_group_ids = [];
	for (i = 0; i < doc.groupItems.length; i++) {
		AE.docGroupObjectIndex[AE.object2id(doc.groupItems[i])] = i;
		untreed_group_ids.push(i);
	}
	var depth = 0;
	var MAX_DEPTH = 50;
	while (untreed_group_ids.length != 0 && (MAX_DEPTH > 0 && depth < MAX_DEPTH)) {
		var marked_for_removal = [];
		for (ii = 0; ii < untreed_group_ids.length; ii++) {
			var i = untreed_group_ids[ii];
			var group = doc.groupItems[i];
			var tree_parent_index = AE.docLayerGroupItemIndexFromObject(group.parent);
			if (tree_parent_index) {
				if (true) { // for debugging

				}
				// add group to subtree
				var tree_parent = AE.docLayerGroupItemFromIndex(tree_parent_index);
				var tree_parent_children = tree_parent['children'];
				tree_parent_children.push(AE.docItemToTreeItem(group, "group", i, tree_parent));
				// set group tree index
				var tree_index = tree_parent_index.concat(tree_parent_children.length-1);
				AE.docGroupTreeIndex[i] = tree_index;
				// mark for removal from  untreed_group_ids
				marked_for_removal.push(ii);
			}
		}
		untreed_group_ids = _.difference(untreed_group_ids, marked_for_removal);
		depth++;
	}
}



AE.docLayerGroupItemFromIndex = function(aid) {
	var r = AE.docLayerGroupTree;
	for (j = 0; j < aid.length; j++) {
		r = r.children[aid[j]];
	}
	return r;
}

AE.treeItem = function() {
	return AE.docLayerGroupItemFromIndex(arguments);
}

AE.docLayerGroupItemIndexFromObject = function(obj) {
	var aid = null;
	var id = AE.object2id(obj);
	if (AE.docLayerTreeIndex[AE.docLayerObjectIndex[id]]) {
		aid = AE.docLayerTreeIndex[AE.docLayerObjectIndex[id]];
	} else if (AE.docGroupTreeIndex[AE.docGroupObjectIndex[id]]) {
		aid = AE.docGroupTreeIndex[AE.docGroupObjectIndex[id]];
	}
	return aid;
}

AE.docLayerGroupItemFromObject = function(obj) {
	var r = null;
	var aid = AE.docLayerGroupItemIndexFromObject(obj);
	if (aid) {
		r = AE.docLayerGroupItemFromIndex(aid);
	}
	return r;
}

AE.docItemShouldBeVisible = function (item,hash_tags,dash_tag) {
	return false;
}

AE.treeItemToObject = function(item) {
	if (item.type == "group") {
		return doc.groupItems[item.id]; 
	} else if (item.type == "layer") {
		var r = doc;
		for (var i = 0; i < item.id.length; i++) {
			r = r.layers[item.id[i]];
		}
		return r;
	}
}

AE.revertTree = function(item) {
	if (!item)
		item = AE.docLayerGroupTree;
	if (item['initially_visible'] != null) {
		Utils.setItemVisibility(AE.treeItemToObject(item),item['initially_visible']);
	}
	for (var i = 0; i < item.children.length; i++) {
		AE.revertTree(item.children[i]);
	}
}


AE.itemDepth = function(item) {
	r = 1;
	i = item;
	while (i.parent != doc) {
		r++;
		i = i.parent;
	}
	return r;
}

AE.maskTree = function(hash_tags, dash_tag, item) {
	if (!hash_tags.length && dash_tag == null) {
		AE.revertTree();
		return;
	}

	if (!item) {
		item = AE.docLayerGroupTree;
	} else {
	}

	if (item != AE.docLayerGroupTree) {
		var itemObject = AE.treeItemToObject(item);
		var answer = item.initially_visible;
		if (hash_tags.length && dash_tag != null) {
			if (_.intersection(hash_tags,item.bubbled_hash_tags).length) {
				answer = (item.dash_tag == null || dash_tag == item.dash_tag);
			} else {
				answer = (dash_tag == item.dash_tag);
			}
		} else if (hash_tags.length) {
			answer = (_.intersection(hash_tags,item.bubbled_hash_tags).length != 0);
		} else if (dash_tag != null) {
			answer = (item.dash_tag == null || dash_tag == item.dash_tag);
		}
		Utils.setItemVisibility(itemObject,answer);
	}

	for (var i = 0; i < item.children.length; i++) {
		AE.maskTree(hash_tags, dash_tag, item.children[i]);
	}
}


AE.createDocLayerGroupTree = function() {
	AE.setDocLayerGroupTreeDefaults();
	AE.createTreeForLayers(doc.layers);
	AE.createTreeForGroups();
}


//
// Export
//

AE.getFormatInfo = function() {
	var r  = {};
	if (this.prefs.format =='PNG 8') {
		r.ext = ".png";
		r.type = ExportType.PNG8;
	} else if (this.prefs.format == 'PNG 24') {
		r.ext = ".png";
		r.type = ExportType.PNG24;
	} else if (this.prefs.format == 'JPG') {
		r.ext = ".jpg";
		r.type = ExportType.JPEG;
	} else if (this.prefs.format == 'PDF') {
		r.ext = ".pdf";
	} else if (this.prefs.format == 'EPS') {
		r.ext = ".eps";
	}
	return r;
}


AE.getFormatOptions = function() {
	var options;
	if (this.prefs.format =='PNG 8') {
		options = new ExportOptionsPNG8();
		options.antiAliasing = true;
		options.transparency = this.prefs.transparency;
		options.artBoardClipping = true;
		options.horizontalScale = this.prefs.scaling;
		options.verticalScale = this.prefs.scaling;
	} else if (this.prefs.format == 'PNG 24') {
		options = new ExportOptionsPNG24();
		options.antiAliasing = true;
		options.transparency = this.prefs.transparency;
		options.artBoardClipping = true;
		options.horizontalScale = this.prefs.scaling;
		options.verticalScale = this.prefs.scaling;
	} else if (this.prefs.format == 'PDF') {
		options = new PDFSaveOptions();
		options.compatibility = PDFCompatibility.ACROBAT5;
		options.generateThumbnails = true;
		options.preserveEditability = false;
	} else if (this.prefs.format == 'JPG') {
		options = new ExportOptionsJPEG();
		options.antiAliasing = true;
		options.artBoardClipping = true;
		options.horizontalScale = this.prefs.scaling;
		options.verticalScale = this.prefs.scaling;
	} else if (this.prefs.format == 'EPS') {
		options = new EPSSaveOptions();
		options.embedLinkedFiles = true;
		options.includeDocumentThumbnails = true;
		options.saveMultipleArtboards = true;
	}
	return options;
}

AE.exportFile = function(fn,info,options) {
	var destFile = new File(fn);
	if (info.ext == ".pdf") {
		options.artboardRange = (i+1).toString();
		doc.saveAs(fn, options)
	} else if (info.ext == ".eps") {
		options.artboardRange = (i+1).toString();
		doc.saveAs(destFile, options);
	} else {
		doc.exportFile(destFile, info.type, options);
	}
}

AE.artboardPureName = function(artboard_name) {
	var words = artboard_name.split(' ');
	var k = [];
	for(var i = 0; i < words.length; i++){
		if (words[i].length == 0) { break }
		var fl = words[i][0];
		if ( fl == "$") {
			k.push(words[i].substr(1,words[i].length));
		} else if (fl == "#") {
			// nopping
		} else if (fl == "-") {
			// nopping
			// k.push(words[i]);
		} else {
		 k.push(words[i])
		}
	}
	return k.join(' ');
}

AE.nameHashTags = function(name) {
	var words = name.split(' ');
	var k = [];
	for(var i = 0; i < words.length; i++){
		if (words[i].length == 0) { break }
		var fl = words[i][0];
		if (fl == "#") {
			k.push(words[i].substr(1,words[i].length));
		}
	}
	return k;
}

AE.firstDashTag = function(name) {
	var dt = AE.nameDashTags(name);
	if (dt.length > 0) {
		return dt[0];
	}
}

AE.nameDashTags = function(name) {
	var words = name.split(' ');
	var k = [];
	for(var i = 0; i < words.length; i++){
		if (words[i].length == 0) { break }
		var fl = words[i][0];
		if (fl == "-") {
			k.push(words[i].substr(1,words[i].length));
		}
	}
	return k;
}

AE.runExport = function() {
	var format_options = this.getFormatOptions();
	var format_info = this.getFormatInfo();
	var num_artboards = doc.artboards.length;
	var num_exported = 0;
	var starting_artboard = 0;

	if (this.prefs.mode == "tagged_artboards") {
		AE.createDocLayerGroupTree();
	}

	for (var i = starting_artboard; i < num_artboards; i++ ) {
		var should_export = false;
		var artboard = doc.artboards[i];
		var artboard_name = doc.artboards[i].name;
		starting_artboard = doc.artboards.setActiveArtboardIndex(i);

		if (this.prefs.mode == "all_artboards") {
			// TODO make sure something visible is in the artboard
			should_export = true;
		} else if (this.prefs.mode == "moneyboards") {
			if ( artboard_name.match(/^\$/) ) {
				// TODO make sure something visible is in the artboard
				should_export = true;
			}
		} else if (this.prefs.mode == "tagged_artboards") {
			if ( artboard_name.match(/^\$/) ) {
				// nopping
			} else {
				var hash_tags = AE.nameHashTags(artboard_name);
				var dash_tags = AE.nameDashTags(artboard_name);
				if (dash_tags.length > 0) {
					for (i = 0; i < dash_tags.length; i++) {
						var dash_tag = dash_tags[i];
						AE.maskTree(hash_tags,dash_tag);
						var filename = this.prefs.base_path + "/" + this.prefs.prefix + AE.artboardPureName(artboard_name) + '-' + dash_tag + this.prefs.suffix + format_info.ext;
						AE.exportFile(filename, format_info, format_options);
					}
					should_export = false;
				} else {
					AE.maskTree(hash_tags,null);
					should_export = true;
				}
			}
		}
		if (should_export) {
			var filename = this.prefs.base_path + "/" + this.prefs.prefix + AE.artboardPureName(artboard_name) + this.prefs.suffix + format_info.ext;
			AE.exportFile(filename, format_info, format_options);
		}
	}

	if (this.prefs.mode == "tagged_artboards") {
		AE.revertTree();
	}

	this.dialog.close();
}

//
//  Init
//

AE.dialog = null;

AE.savePrefs = function() {
	this.prefs_xml.base_path = this.prefs.base_path;
	this.prefs_xml.scaling = this.prefs.scaling;
	this.prefs_xml.prefix = this.prefs.prefix;
	this.prefs_xml.suffix = this.prefs.suffix;
	this.prefs_xml.transparency = this.prefs.transparency;
	this.prefs_xml.format = this.prefs.format;
	this.prefs_xml.mode = this.prefs.mode;
	this.info_layer.textFrames[0].contents = this.prefs_xml.toXMLString();
}


AE.showDialog = function() {
	this.dialog = new Window('dialog', 'Assembly Exporter');

	var column_group = this.dialog.add('group',undefined,'');
	column_group.orientation = 'row';
	column_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	// Mode Panel
	var mode_panel = column_group.add('panel',undefined,'');

	// RIGHT Mode Row
	var mode_group = mode_panel.add('group', undefined, '');
	mode_group.orientation = 'row';
	mode_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var mode_group_label = mode_group.add('statictext', undefined, 'Mode:');
	mode_group_label.size = [ 100,20 ];

	var mode_group_select = mode_group.add('dropdownlist', undefined, _.map(AE.modes,function(i){ return i['label']; }));

	function selectedModeIndex() {
		for(var i = 0; i < AE.modes.length; i++) {
			if (AE.prefs.mode == AE.modes[i]['name']) {
				return i;
			}
		}
	}
	mode_group_select.selection = selectedModeIndex();

	// Description Row
	var description_group = mode_panel.add('group', undefined, '');
	description_group.orientation = 'row';
	description_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var description_group_label = description_group.add('statictext', undefined, AE.modes[selectedModeIndex()]['description'], {multiline: true});

	// Export type handler
	mode_group_select.onChange = function() {
		AE.prefs.mode = AE.modes[mode_group_select.selection.index]['name'];
		description_group_label.text = AE.modes[selectedModeIndex()]['description'];
		//AE.dialog.update();
	};

	// LEFT Settings Group
	var settings_group = column_group.add('group',undefined,'');
	settings_group.orientation = 'column';
	settings_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	// Prefix Row
	var prefix_group = settings_group.add('group', undefined, '')
	prefix_group.orientation = 'row';
	prefix_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var prefix_label = prefix_group.add('statictext', undefined, 'File prefix:');
	prefix_label.size = [100,20]

	var prefix_input = prefix_group.add('edittext', undefined, this.prefs.prefix);
	prefix_input.size = [300,20];

	// Suffix Row
	var suffix_group = settings_group.add('group', undefined, '')
	suffix_group.orientation = 'row';
	suffix_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var suffix_label = suffix_group.add('statictext', undefined, 'File suffix:');
	suffix_label.size = [100,20]

	var suffix_input = suffix_group.add('edittext', undefined, this.prefs.suffix);
	suffix_input.size = [300,20];

	var scaling_group = settings_group.add('group', undefined, '')
	scaling_group.oreintation = 'row';
	scaling_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var scaling_label = scaling_group.add('statictext', undefined, 'Scaling:');
	scaling_label.size = [100,20]

	var scaling_input = scaling_group.add('edittext', undefined, this.prefs.scaling);
	scaling_input.size = [100,20];

	var scaling_label2 = scaling_group.add('statictext', undefined, '(Normally 100%; Use 200% for Retina dislay exports)');
	scaling_label2.size = [300,20]

	// Directory Row
	var directory_group = settings_group.add( 'group', undefined, '')
	directory_group.orientation = 'row'
	directory_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var directory_label = directory_group.add('statictext', undefined, 'Output directory:');
	directory_label.size = [100,20];

	var directory_input = directory_group.add('edittext', undefined, this.prefs.base_path);
	directory_input.size = [300,20];

	var directory_choose_button = directory_group.add('button', undefined, 'Choose ...' );
	directory_choose_button.onClick = function() { directory_input.text = Folder.selectDialog(); }

	// Transparency and Format Row
	var export_group = settings_group.add('group', undefined, '');
	export_group.orientation = 'row'
	export_group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var format_label = export_group.add('statictext', undefined, 'Export format:');
	format_label.size = [ 100,20 ];

	var format_list = export_group.add('dropdownlist', undefined, [ 'PNG 8', 'PNG 24', 'PDF', 'JPG', 'EPS' ]);

	format_list.selection = 1;
	for ( var i=0; i < format_list.items.length; i++ ) {
		if ( AE.prefs.format == format_list.items[i].text ) {
			 format_list.selection = i;
		}
	}

	var transparency_input = export_group.add('checkbox', undefined, 'Transparency');
	transparency_input.value = this.prefs.transparency;

	// TODO add progress bar
	//var progress_bar = this.dialog.add( 'progressbar', undefined, 0, 100 );
	//progress_bar.size = [400,10]

	var button_panel = this.dialog.add('group', undefined, '');
	button_panel.orientation = 'row'

	button_panel.cancel_button = button_panel.add('button', undefined, 'Cancel', {name:'cancel'});
	button_panel.cancel_button.onClick = function() { AE.dialog.close() };

	button_panel.ok_button = button_panel.add('button', undefined, 'Export', {name:'ok'});
	button_panel.ok_button.onClick = function() {
		AE.prefs.prefix = prefix_input.text;
		AE.prefs.suffix = suffix_input.text;
		AE.prefs.base_path = directory_input.text;
		AE.prefs.transparency = transparency_input.value;
		AE.prefs.format = format_list.selection.text;
		AE.prefs.scaling = parseFloat( scaling_input.text.replace( /\% /, '' ));
		AE.prefs.mode = AE.modes[mode_group_select.selection.index]['name'];
		AE.savePrefs();
		AE.runExport();
	};

	this.dialog.show();
}

AE.init = function() {
	var parse_success = AE.initPrefs();
	if (parse_success) {
		AE.showDialog();
	}
}

AE.init();
