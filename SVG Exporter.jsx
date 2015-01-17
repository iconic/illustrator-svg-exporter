/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Waybury
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

#target illustrator

var exportFolder,
    sourceDoc,
    itemsToExport,
    exportDoc,
    svgOptions;

try {
  if ( app.documents.length > 0 ) {
    svgOptions = new ExportOptionsSVG();
    svgOptions.artBoardClipping = true;
    svgOptions.embedRasterImages = false;
    svgOptions.cssProperties = SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES;
    svgOptions.fontSubsetting = SVGFontSubsetting.None;
    svgOptions.documentEncoding = SVGDocumentEncoding.UTF8;
    svgOptions.coordinatePrecision = 4;

    itemsToExport = [];
    sourceDoc = app.activeDocument;
    exportFolder = Folder.selectDialog('Select Folder to Save Files');
    exportDoc = documents.add(DocumentColorSpace.RGB);

    main();

    exportDoc.close(SaveOptions.DONOTSAVECHANGES);
  }
  else{
    throw new Error('There are no documents open. Open a document and try again.');
  }
}
catch(e) {
  alert(e.message, "Script Alert", true);
}

function main() {
  var item;

  itemsToExport = getNamedItems(sourceDoc);

  for ( var i = 0, len = itemsToExport.length; i < len; i++ ) {

    item = itemsToExport[i];

    if ( item.typename === 'Layer' ) {
      exportLayer(item);
    } else {
      exportItem(item);
    }

    // Empty export document
    while ( exportDoc.layers[0].pageItems.length ) {
      exportDoc.layers[0].pageItems[0].remove();
    }
  }
}

function exportLayer(layer) {

  var item,
      startX,
      startY,
      endX,
      endY,
      name,
      prettyName,
      itemName,
      layerItems;

  layerItems = [];

  for ( var i = 0, len = layer.pageItems.length; i < len; i++ ) {
    layerItems.push(layer.pageItems[i]);
  }
  recurseItems(layer.layers, layerItems);

  if ( !layerItems.length ) {
    return;
  }

  name = layer.name;
  prettyName = name.slice(0, -4).replace(/[^\w\s]|_/g, " ").replace(/\s+/g, "-").toLowerCase();

  for ( i = 0, len = layerItems.length; i < len; i++ ) {
    app.activeDocument = sourceDoc;
    item = layerItems[i];
    item.duplicate( exportDoc, ElementPlacement.PLACEATEND );
  }

  app.activeDocument = exportDoc;

  for ( i = 0, len = exportDoc.pageItems.length; i < len; i++) {

    item = exportDoc.pageItems[i];
    item.hidden = false;

    if(item.name) {
      itemName = item.name;
      if(itemName.split('.').pop() === 'svg') {
        itemName = itemName.slice(0, -4);
      }
      itemName = itemName.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, "-").toLowerCase()

      item.name = prettyName + '-' + itemName;
    }
    /*
     * We want the smallest startX, startY for obvious reasons.
     * We also want the smallest endX and endY because Illustrator
     * Extendscript treats this coordinate reversed to how the UI
     * treats it (e.g., -142 in the UI is 142).
     *
     */
    startX = ( !startX || startX > item.visibleBounds[0] ) ? item.visibleBounds[0] : startX;
    startY = ( !startY || startY < item.visibleBounds[1] ) ? item.visibleBounds[1] : startY;
    endX = ( !endX || endX < item.visibleBounds[2] ) ? item.visibleBounds[2] : endX;
    endY = ( !endY || endY > item.visibleBounds[3] ) ? item.visibleBounds[3] : endY;
  }

  exportDoc.layers[0].name = name.slice(0, -4);
  exportSVG( exportDoc, name, [startX, startY, endX, endY], svgOptions );
}

function exportItem(item) {

  var name,
      newItem;

  name = item.name;
  newItem = item.duplicate( exportDoc, ElementPlacement.PLACEATEND );
  newItem.hidden = false;
  newItem.name = item.name.slice(0, -4);
  app.activeDocument = exportDoc;

  exportDoc.layers[0].name = ' ';
  exportSVG( exportDoc, name, item.visibleBounds, svgOptions );
}

function exportSVG(doc, name, bounds, exportOptions) {

  doc.artboards[0].artboardRect = bounds;

  var file = new File( exportFolder.fsName + '/' + name );
  doc.exportFile( file, ExportType.SVG, exportOptions );
}

function getNamedItems(doc) {
  var item,
      items,
      doclayers;

  items = [];

  // Check all pageItems for name match
  for ( var i = 0, len = doc.pageItems.length; i < len; i++ ) {
    item =  doc.pageItems[i];

    if ( item.name.split('.').pop() === 'svg' && !item.locked && !anyParentLocked(item) ) {
      items.push(item);
    }
  }

  // Check all layers for name match
  doclayers = [];
  recurseLayers( doc.layers, doclayers );

  for ( i = 0, len = doclayers.length; i < len; i++ ) {
    item = doclayers[i];

    if ( item.name.split('.').pop() === 'svg' && !item.locked && !anyParentLocked(item) ) {
      items.push(item);
    }
  }

  return items;
}

function recurseLayers(layers, layerArray) {

  var layer;

  for ( var i = 0, len = layers.length; i < len; i++ ) {
    layer = layers[i];
    if ( !layer.locked ) {
      layerArray.push(layer);
    }
    if (layer.layers.length > 0) {
      recurseLayers( layer.layers, layerArray );
    }
  }
}

function recurseItems(layers, items) {

  var layer;

  for ( var i = 0, len = layers.length; i < len; i++ ) {
    layer = layers[i];
    if ( layer.pageItems.length > 0 && !layer.locked ) {
      for ( var j = 0, plen = layer.pageItems.length; j < plen; j++ ) {
        if ( !layer.pageItems[j].locked ) {
          items.push(layer.pageItems[j]);
        }
      }
    }

    if ( layer.layers.length > 0 ) {
      recurseItems( layer.layers, items );
    }
  }
}

function anyParentLocked(item) {
  while ( item.parent ) {
    if ( item.parent.locked ) {
      return true;
    }
    item = item.parent;
  }

  return false;
}
