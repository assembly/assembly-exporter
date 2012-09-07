# AssemblyExporter for Adobe Illustrator

AssemblyExporter helps you organize and mass export assets directly from Adobe Illustrator mockups by letting you coordinate artboards, layers, and groups using tags.

It was originally inspired by the New York Times MultiExport script (Copyright 2011) by Matthew Ericson.

We hope it saves you as much time as it saves us.

## Install

On OSX, run this command in your terminal:

    curl https://raw.github.com/assembly/assembly-exporter/master/AssemblyExporter.jsx \
      > /Applications/Adobe\ Illustrator\ CS*/Presets.localized/en_US/Scripts/AssemblyExporter.jsx

On Windows, download the AssemblyExporter.jsx script and install it in your Adobe Illustrator scripts directory.

## Usage

### Export  Modes

#### All Artboards

Exports all artboards, plain and simple.

Exported filenames won't include the $ or any #hash or -dash tags.

#### Moneyboards

Exports all artboards prefaced with $ (for example $HomePage).

Moneyboard are an easy way for you to designate and mass export full mockups while ignoring asset artboards.

They're called moneyboard because they're the ones that wow the clients and get you paid.

#### Tagged Artboards

Exports artboards while hiding all layers and groups without a matching tag.

\#hash tags: An artboard "logo #fg" hides all layers and groups, except those tagged with #fg. Exports to "logo.png".

-dash tags: An artboard "logo #fg -active -inactive" does the same, but individually exports "logo-active.png" using -active content and "logo-inactive.png" using -inactive content.

Moneyboards are ignored.
