# Illustrator SVG Exporter

Exporting SVGs from Illustrator is a slow, laborious process&mdash;this script fixes that. The script doesn't waste your time with GUI or settings you'll never use. You just run the script, select a location to export and you have your SVGs. We love the concept behind [Generator](http://blogs.adobe.com/photoshopdotcom/2013/09/introducing-adobe-generator-for-photoshop-cc.html) and this script takes a strong cue from it. The script exports any layer, group or path named with the `.svg` extension. We use this script to export all our icons for [Open Iconic](https://github.com/iconic/open-iconic).

## Installation

You don't _have_ to install the script to use it (more on that later), but installing the script is by far the best way to use it. All you need to do is drop the `SVG Exporter.jsx` file in one of the following directories:

* Windows: `C:\Program Files\Adobe\Adobe Illustrator CC 2015\Presets\[language]\Scripts\`
* Mac OS: `/Applications/Adobe Illustrator CC 2015/Presets/[language]/Scripts/`

Note: Make sure to restart Illustrator if you installed the script while the Application is running.

## Running the Script

Once the script is installed, you'll be able to run it by going to `File > Scripts > SVG Exporter`. As mentioned, you don't need to install the script. If you want to run it as a one-off, select `File > Scripts > Other Script...` and select the `SVG Exporter.jsx` file in the file chooser.

Once you run the script, you'll be prompted to select a location to save the SVG files. After a location is set, you're done&mdash;the script does the rest.

## Document Setup

The script doesn't force any setup or organization on you. You can export layers, groups, compound paths or individual paths. Just name the path/layer/group/compound path what you want the file name to be (e.g., my-cool-vector-drawing.svg) and the script will prep it for export. You can export nested layers (example: export indiviual assets as well all assets in a parent layer). The exported SVGs will be cropped to the bounding box of the path/group/layer.

You can name artboards with a `.svg` extension to export SVGs to specific dimensions other than the paths' bounding box. All paths within the artboard will be exported, so make sure to clean up any unwanted paths before export.

If you want to individually name each element in your SVG for CSS styling (ala [Iconic](http://useiconic.com)), just name each path within a layer or group you wish to have exported. The script will santize the name so that it will be converted to a pretty ID by Illustrator's SVG export engine. _**Hint:** We've also made a slick [Grunt tool](https://github.com/iconic/grunt-svg-toolkit) which (among other things) will convert the IDs from the Illustrator-exported SVG to classes._

If you previously named an element for export but now don't want to export for some reason, simply lock it to keep it from being exported.
