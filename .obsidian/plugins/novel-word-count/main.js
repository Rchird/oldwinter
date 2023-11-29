/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NovelWordCountPlugin
});
module.exports = __toCommonJS(main_exports);

// logic/debug.ts
var DebugHelper = class {
  constructor() {
    this.debugMode = false;
  }
  setDebugMode(debug) {
    this.debugMode = debug;
  }
  debug(...args) {
    if (!this.debugMode) {
      return;
    }
    console.log("novel-word-count:", ...args);
  }
  error(message) {
    if (!this.debugMode) {
      return;
    }
    console.error(message);
  }
  debugStart(name) {
    if (!this.debugMode) {
      return () => {
      };
    }
    var qualifiedName = `novel-word-count|${name}`;
    console.time(qualifiedName);
    return () => console.timeEnd(qualifiedName);
  }
};

// logic/file.ts
var import_obsidian = require("obsidian");

// logic/settings.ts
var countTypeDisplayStrings = {
  ["none" /* None */]: "None",
  ["word" /* Word */]: "Word Count",
  ["page" /* Page */]: "Page Count",
  ["pagedecimal" /* PageDecimal */]: "Page Count (decimal)",
  ["percentgoal" /* PercentGoal */]: "% of Word Goal",
  ["note" /* Note */]: "Note Count",
  ["character" /* Character */]: "Character Count",
  ["link" /* Link */]: "Link Count",
  ["embed" /* Embed */]: "Embed Count",
  ["alias" /* Alias */]: "First Alias",
  ["created" /* Created */]: "Created Date",
  ["modified" /* Modified */]: "Last Updated Date",
  ["filesize" /* FileSize */]: "File Size"
};
var countTypeDescriptions = {
  ["none" /* None */]: "Hidden.",
  ["word" /* Word */]: "Total words.",
  ["page" /* Page */]: "Total pages, rounded up.",
  ["pagedecimal" /* PageDecimal */]: "Total pages, precise to 2 digits after the decimal.",
  ["percentgoal" /* PercentGoal */]: "Set a word goal by adding the 'word-goal' property to a note.",
  ["note" /* Note */]: "Total notes.",
  ["character" /* Character */]: "Total characters (letters, symbols, numbers, and spaces).",
  ["link" /* Link */]: "Total links to other notes.",
  ["embed" /* Embed */]: "Total embedded images, files, and notes.",
  ["alias" /* Alias */]: "The first alias property of each note.",
  ["created" /* Created */]: "Creation date. (On folders: earliest creation date of any note.)",
  ["modified" /* Modified */]: "Date of last edit. (On folders: latest edit date of any note.)",
  ["filesize" /* FileSize */]: "Total size on hard drive."
};
function getDescription(countType) {
  return `[${countTypeDisplayStrings[countType]}] ${countTypeDescriptions[countType]}`;
}
var countTypes = [
  "none" /* None */,
  "word" /* Word */,
  "page" /* Page */,
  "pagedecimal" /* PageDecimal */,
  "percentgoal" /* PercentGoal */,
  "note" /* Note */,
  "character" /* Character */,
  "link" /* Link */,
  "embed" /* Embed */,
  "alias" /* Alias */,
  "created" /* Created */,
  "modified" /* Modified */,
  "filesize" /* FileSize */
];
var alignmentTypes = [
  "inline" /* Inline */,
  "right" /* Right */,
  "below" /* Below */
];
var DEFAULT_SETTINGS = {
  countType: "word" /* Word */,
  countType2: "none" /* None */,
  countType3: "none" /* None */,
  showSameCountsOnFolders: true,
  folderCountType: "word" /* Word */,
  folderCountType2: "none" /* None */,
  folderCountType3: "none" /* None */,
  abbreviateDescriptions: false,
  alignment: "inline" /* Inline */,
  debugMode: false,
  wordsPerPage: 300,
  charsPerPage: 1500,
  charsPerPageIncludesWhitespace: false,
  wordCountType: "SpaceDelimited" /* SpaceDelimited */,
  pageCountType: "ByWords" /* ByWords */,
  excludeComments: false
};

// logic/file.ts
var FileHelper = class {
  constructor(app, plugin) {
    this.app = app;
    this.plugin = plugin;
    this.debugHelper = new DebugHelper();
    this.cjkRegex = /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}|[0-9]+/gu;
    this.ExcludedFileTypes = /* @__PURE__ */ new Set([
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "avif",
      "heic"
    ]);
  }
  get settings() {
    return this.plugin.settings;
  }
  get vault() {
    return this.app.vault;
  }
  async getAllFileCounts(wordCountType) {
    const debugEnd = this.debugHelper.debugStart("getAllFileCounts");
    const files = this.vault.getMarkdownFiles();
    const counts = {};
    for (const file of files) {
      const contents = await this.vault.cachedRead(file);
      this.setCounts(counts, file, contents, wordCountType);
    }
    debugEnd();
    return counts;
  }
  getCountDataForPath(counts, path) {
    if (counts.hasOwnProperty(path)) {
      return counts[path];
    }
    const childPaths = Object.keys(counts).filter(
      (countPath) => path === "/" || countPath.startsWith(path + "/")
    );
    const directoryDefault = {
      isDirectory: true,
      noteCount: 0,
      wordCount: 0,
      wordCountTowardGoal: 0,
      wordGoal: 0,
      pageCount: 0,
      characterCount: 0,
      nonWhitespaceCharacterCount: 0,
      linkCount: 0,
      embedCount: 0,
      aliases: null,
      createdDate: 0,
      modifiedDate: 0,
      sizeInBytes: 0
    };
    return childPaths.reduce((total, childPath) => {
      const childCount = this.getCountDataForPath(counts, childPath);
      return {
        isDirectory: true,
        noteCount: total.noteCount + childCount.noteCount,
        linkCount: total.linkCount + childCount.linkCount,
        embedCount: total.embedCount + childCount.embedCount,
        aliases: [],
        wordCount: total.wordCount + childCount.wordCount,
        wordCountTowardGoal: total.wordCountTowardGoal + childCount.wordCountTowardGoal,
        wordGoal: total.wordGoal + childCount.wordGoal,
        pageCount: total.pageCount + childCount.pageCount,
        characterCount: total.characterCount + childCount.characterCount,
        nonWhitespaceCharacterCount: total.nonWhitespaceCharacterCount + childCount.nonWhitespaceCharacterCount,
        createdDate: total.createdDate === 0 ? childCount.createdDate : Math.min(total.createdDate, childCount.createdDate),
        modifiedDate: Math.max(
          total.modifiedDate,
          childCount.modifiedDate
        ),
        sizeInBytes: total.sizeInBytes + childCount.sizeInBytes
      };
    }, directoryDefault);
  }
  setDebugMode(debug) {
    this.debugHelper.setDebugMode(debug);
  }
  async updateFileCounts(abstractFile, counts, wordCountType) {
    if (abstractFile instanceof import_obsidian.TFolder) {
      this.debugHelper.debug("updateFileCounts called on instance of TFolder");
      Object.assign(counts, this.getAllFileCounts(wordCountType));
      return;
    }
    if (abstractFile instanceof import_obsidian.TFile) {
      const contents = await this.vault.cachedRead(abstractFile);
      this.setCounts(counts, abstractFile, contents, wordCountType);
    }
  }
  countEmbeds(metadata) {
    var _a, _b;
    return (_b = (_a = metadata.embeds) == null ? void 0 : _a.length) != null ? _b : 0;
  }
  countLinks(metadata) {
    var _a, _b;
    return (_b = (_a = metadata.links) == null ? void 0 : _a.length) != null ? _b : 0;
  }
  countNonWhitespaceCharacters(content) {
    return (content.replace(/\s+/g, "") || []).length;
  }
  countWords(content, wordCountType) {
    switch (wordCountType) {
      case "CJK" /* CJK */:
        return (content.match(this.cjkRegex) || []).length;
      case "AutoDetect" /* AutoDetect */:
        const cjkLength = (content.match(this.cjkRegex) || []).length;
        const spaceDelimitedLength = (content.match(/[^\s]+/g) || []).length;
        return Math.max(cjkLength, spaceDelimitedLength);
      case "SpaceDelimited" /* SpaceDelimited */:
      default:
        return (content.match(/[^\s]+/g) || []).length;
    }
  }
  setCounts(counts, file, content, wordCountType) {
    counts[file.path] = {
      isDirectory: false,
      noteCount: 1,
      wordCount: 0,
      wordCountTowardGoal: 0,
      wordGoal: 0,
      pageCount: 0,
      characterCount: 0,
      nonWhitespaceCharacterCount: 0,
      linkCount: 0,
      embedCount: 0,
      aliases: [],
      createdDate: file.stat.ctime,
      modifiedDate: file.stat.mtime,
      sizeInBytes: file.stat.size
    };
    const metadata = this.app.metadataCache.getFileCache(file);
    if (!this.shouldCountFile(file, metadata)) {
      return;
    }
    const meaningfulContent = this.getMeaningfulContent(content, metadata);
    const wordCount = this.countWords(meaningfulContent, wordCountType);
    const wordGoal = this.getWordGoal(metadata);
    const characterCount = meaningfulContent.length;
    const nonWhitespaceCharacterCount = this.countNonWhitespaceCharacters(meaningfulContent);
    let pageCount = 0;
    if (this.settings.pageCountType === "ByWords" /* ByWords */) {
      const wordsPerPage = Number(this.settings.wordsPerPage);
      const wordsPerPageValid = !isNaN(wordsPerPage) && wordsPerPage > 0;
      pageCount = wordCount / (wordsPerPageValid ? wordsPerPage : 300);
    } else if (this.settings.pageCountType === "ByChars" /* ByChars */ && !this.settings.charsPerPageIncludesWhitespace) {
      const charsPerPage = Number(this.settings.charsPerPage);
      const charsPerPageValid = !isNaN(charsPerPage) && charsPerPage > 0;
      pageCount = nonWhitespaceCharacterCount / (charsPerPageValid ? charsPerPage : 1500);
    } else if (this.settings.pageCountType === "ByChars" /* ByChars */ && this.settings.charsPerPageIncludesWhitespace) {
      const charsPerPage = Number(this.settings.charsPerPage);
      const charsPerPageValid = !isNaN(charsPerPage) && charsPerPage > 0;
      pageCount = characterCount / (charsPerPageValid ? charsPerPage : 1500);
    }
    Object.assign(counts[file.path], {
      wordCount,
      wordCountTowardGoal: wordGoal !== null ? wordCount : 0,
      wordGoal,
      pageCount,
      characterCount,
      nonWhitespaceCharacterCount,
      linkCount: this.countLinks(metadata),
      embedCount: this.countEmbeds(metadata),
      aliases: (0, import_obsidian.parseFrontMatterAliases)(metadata.frontmatter)
    });
  }
  getWordGoal(metadata) {
    const goal = metadata.frontmatter && metadata.frontmatter["word-goal"];
    if (!goal || isNaN(Number(goal))) {
      return null;
    }
    return Number(goal);
  }
  getMeaningfulContent(content, metadata) {
    let meaningfulContent = content;
    const hasFrontmatter = !!metadata.frontmatter;
    if (hasFrontmatter) {
      const frontmatterPos = metadata.frontmatterPosition || metadata.frontmatter.position;
      meaningfulContent = frontmatterPos && frontmatterPos.start && frontmatterPos.end ? meaningfulContent.slice(0, frontmatterPos.start.offset) + meaningfulContent.slice(frontmatterPos.end.offset) : meaningfulContent;
    }
    if (this.settings.excludeComments) {
      const hasComments = meaningfulContent.includes("%%");
      if (hasComments) {
        const splitByComments = meaningfulContent.split("%%");
        meaningfulContent = splitByComments.filter((_, ix) => ix % 2 == 0).join("");
      }
    }
    return meaningfulContent;
  }
  shouldCountFile(file, metadata) {
    if (this.ExcludedFileTypes.has(file.extension.toLowerCase())) {
      return false;
    }
    if (metadata.frontmatter && metadata.frontmatter.hasOwnProperty("wordcount") && (metadata.frontmatter.wordcount === null || metadata.frontmatter.wordcount === false || metadata.frontmatter.wordcount === "false")) {
      return false;
    }
    const tags = (0, import_obsidian.getAllTags)(metadata).map((tag) => tag.toLowerCase());
    if (tags.length && (tags.includes("#excalidraw") || tags.filter((tag) => tag.startsWith("#exclude")).map((tag) => tag.replace(/[-_]/g, "")).includes("#excludefromwordcount"))) {
      return false;
    }
    return true;
  }
};

// logic/filesize.ts
var formatThresholds = [{
  suffix: "b",
  suffixLong: " B",
  divisor: 1
}, {
  suffix: "kb",
  suffixLong: " KB",
  divisor: 1e3
}, {
  suffix: "mb",
  suffixLong: " MB",
  divisor: 1e6
}, {
  suffix: "gb",
  suffixLong: " GB",
  divisor: 1e9
}, {
  suffix: "tb",
  suffixLong: " TB",
  divisor: 1e12
}];
var FileSizeHelper = class {
  formatFileSize(bytes, shouldAbbreviate) {
    const largestThreshold = formatThresholds.last();
    for (const formatThreshold of formatThresholds) {
      if (bytes < formatThreshold.divisor * 1e3 || formatThreshold === largestThreshold) {
        const units = bytes / formatThreshold.divisor;
        const suffix = shouldAbbreviate ? formatThreshold.suffix : formatThreshold.suffixLong;
        return `${this.round(units)}${suffix}`;
      }
    }
    return `?B`;
  }
  round(value) {
    return value.toLocaleString(void 0, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
};

// main.ts
var import_obsidian2 = require("obsidian");
var NovelWordCountPlugin = class extends import_obsidian2.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.debugHelper = new DebugHelper();
    this.fileSizeHelper = new FileSizeHelper();
    this.fileHelper = new FileHelper(this.app, this);
  }
  get settings() {
    return this.savedData.settings;
  }
  // LIFECYCLE
  async onload() {
    await this.loadSettings();
    this.fileHelper.setDebugMode(this.savedData.settings.debugMode);
    this.debugHelper.setDebugMode(this.savedData.settings.debugMode);
    this.debugHelper.debug("onload lifecycle hook");
    this.addSettingTab(new NovelWordCountSettingTab(this.app, this));
    this.addCommand({
      id: "recount-vault",
      name: "Reanalyze (recount) all documents in vault",
      callback: async () => {
        this.debugHelper.debug("[Reanalyze] command triggered");
        await this.initialize();
      }
    });
    this.addCommand({
      id: "cycle-count-type",
      name: "Show next data type (1st position)",
      callback: async () => {
        this.debugHelper.debug("[Cycle next data type] command triggered");
        this.settings.countType = countTypes[(countTypes.indexOf(this.settings.countType) + 1) % countTypes.length];
        await this.saveSettings();
        this.updateDisplayedCounts();
      }
    });
    this.addCommand({
      id: "toggle-abbreviate",
      name: "Toggle abbreviation",
      callback: async () => {
        this.debugHelper.debug("[Toggle abbrevation] command triggered");
        this.settings.abbreviateDescriptions = !this.settings.abbreviateDescriptions;
        await this.saveSettings();
        this.updateDisplayedCounts();
      }
    });
    for (const countType of countTypes) {
      this.addCommand({
        id: `set-count-type-${countType}`,
        name: `Show ${countTypeDisplayStrings[countType]} (1st position)`,
        callback: async () => {
          this.debugHelper.debug(
            `[Set count type to ${countType}] command triggered`
          );
          this.settings.countType = countType;
          await this.saveSettings();
          this.updateDisplayedCounts();
        }
      });
    }
    this.handleEvents();
    this.initialize();
  }
  async onunload() {
    this.saveSettings();
  }
  // SETTINGS
  async loadSettings() {
    const loaded = await this.loadData();
    if (loaded && loaded.settings && loaded.settings.countType && !countTypes.includes(loaded.settings.countType)) {
      loaded.settings.countType = "word" /* Word */;
    }
    this.savedData = Object.assign({}, loaded);
    this.savedData.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      this.savedData.settings
    );
  }
  async saveSettings() {
    await this.saveData(this.savedData);
  }
  // PUBLIC
  async initialize(refreshAllCounts = true) {
    this.debugHelper.debug("initialize");
    if (refreshAllCounts) {
      await this.refreshAllCounts();
    }
    try {
      await this.updateDisplayedCounts();
    } catch (err) {
      this.debugHelper.debug("Error while updating displayed counts");
      this.debugHelper.error(err);
      setTimeout(() => {
        this.initialize(false);
      }, 1e3);
    }
  }
  async updateDisplayedCounts(file = null) {
    var _a;
    const debugEnd = this.debugHelper.debugStart("updateDisplayedCounts");
    if (!Object.keys(this.savedData.cachedCounts).length) {
      this.debugHelper.debug("No cached data found; refreshing all counts.");
      await this.refreshAllCounts();
    }
    const fileExplorerLeaf = await this.getFileExplorerLeaf();
    this.setContainerClass(fileExplorerLeaf);
    const fileItems = fileExplorerLeaf.view.fileItems;
    if (file) {
      const relevantItems = Object.keys(fileItems).filter(
        (path) => file.path.includes(path)
      );
      this.debugHelper.debug(
        "Setting display counts for",
        relevantItems.length,
        "fileItems matching path",
        file.path
      );
    } else {
      this.debugHelper.debug(
        `Setting display counts for ${Object.keys(fileItems).length} fileItems`
      );
    }
    for (const path in fileItems) {
      if (file && !file.path.includes(path)) {
        continue;
      }
      const counts = this.fileHelper.getCountDataForPath(
        this.savedData.cachedCounts,
        path
      );
      const item = fileItems[path];
      ((_a = item.titleEl) != null ? _a : item.selfEl).setAttribute(
        "data-novel-word-count-plugin",
        this.getNodeLabel(counts)
      );
    }
    debugEnd();
  }
  // FUNCTIONALITY
  async getFileExplorerLeaf() {
    return new Promise((resolve, reject) => {
      let foundLeaf = null;
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (foundLeaf) {
          return;
        }
        const view = leaf.view;
        if (!view || !view.fileItems) {
          return;
        }
        foundLeaf = leaf;
        resolve(foundLeaf);
      });
      if (!foundLeaf) {
        reject(Error("Could not find file explorer leaf."));
      }
    });
  }
  getDataTypeLabel(counts, countType, abbreviateDescriptions) {
    if (!counts || typeof counts.wordCount !== "number") {
      return null;
    }
    const getPluralizedCount = function(noun, count, round = true) {
      const displayCount = round ? Math.ceil(count).toLocaleString(void 0) : count.toLocaleString(void 0, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      });
      return `${displayCount} ${noun}${displayCount == "1" ? "" : "s"}`;
    };
    switch (countType) {
      case "none" /* None */:
        return null;
      case "word" /* Word */:
        return abbreviateDescriptions ? `${Math.ceil(counts.wordCount).toLocaleString()}w` : getPluralizedCount("word", counts.wordCount);
      case "page" /* Page */:
        return abbreviateDescriptions ? `${Math.ceil(counts.pageCount).toLocaleString()}p` : getPluralizedCount("page", counts.pageCount);
      case "pagedecimal" /* PageDecimal */:
        return abbreviateDescriptions ? `${counts.pageCount.toLocaleString(void 0, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        })}p` : getPluralizedCount("page", counts.pageCount, false);
      case "percentgoal" /* PercentGoal */:
        if (counts.wordGoal <= 0) {
          return null;
        }
        const fraction = counts.wordCountTowardGoal / counts.wordGoal;
        const percent = Math.round(fraction * 100).toLocaleString(void 0);
        return abbreviateDescriptions ? `${percent}%` : `${percent}% of ${counts.wordGoal.toLocaleString(void 0)}`;
      case "note" /* Note */:
        return abbreviateDescriptions ? `${counts.noteCount.toLocaleString()}n` : getPluralizedCount("note", counts.noteCount);
      case "character" /* Character */:
        return abbreviateDescriptions ? `${counts.characterCount.toLocaleString()}ch` : getPluralizedCount("character", counts.characterCount);
      case "link" /* Link */:
        if (counts.linkCount === 0) {
          return null;
        }
        return abbreviateDescriptions ? `${counts.linkCount.toLocaleString()}x` : getPluralizedCount("link", counts.linkCount);
      case "embed" /* Embed */:
        if (counts.embedCount === 0) {
          return null;
        }
        return abbreviateDescriptions ? `${counts.embedCount.toLocaleString()}em` : getPluralizedCount("embed", counts.embedCount);
      case "alias" /* Alias */:
        if (!counts.aliases || !Array.isArray(counts.aliases) || !counts.aliases.length) {
          return null;
        }
        return abbreviateDescriptions ? `${counts.aliases[0]}` : `alias: ${counts.aliases[0]}${counts.aliases.length > 1 ? ` +${counts.aliases.length - 1}` : ""}`;
      case "created" /* Created */:
        if (counts.createdDate === 0) {
          return null;
        }
        return abbreviateDescriptions ? `${new Date(counts.createdDate).toLocaleDateString()}/c` : `Created ${new Date(counts.createdDate).toLocaleDateString()}`;
      case "modified" /* Modified */:
        if (counts.modifiedDate === 0) {
          return null;
        }
        return abbreviateDescriptions ? `${new Date(counts.modifiedDate).toLocaleDateString()}/u` : `Updated ${new Date(counts.modifiedDate).toLocaleDateString()}`;
      case "filesize" /* FileSize */:
        return this.fileSizeHelper.formatFileSize(
          counts.sizeInBytes,
          abbreviateDescriptions
        );
    }
    return null;
  }
  getNodeLabel(counts) {
    const countTypes2 = counts.isDirectory && !this.settings.showSameCountsOnFolders ? [
      this.settings.folderCountType,
      this.settings.folderCountType2,
      this.settings.folderCountType3
    ] : [
      this.settings.countType,
      this.settings.countType2,
      this.settings.countType3
    ];
    return countTypes2.filter((ct) => ct !== "none" /* None */).map(
      (ct) => this.getDataTypeLabel(counts, ct, this.settings.abbreviateDescriptions)
    ).filter((display) => display !== null).join(" | ");
  }
  async handleEvents() {
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        this.debugHelper.debug(
          "[modify] vault hook fired, recounting file",
          file.path
        );
        await this.fileHelper.updateFileCounts(
          file,
          this.savedData.cachedCounts,
          this.settings.wordCountType
        );
        await this.updateDisplayedCounts(file);
        await this.saveSettings();
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", async (file) => {
        this.debugHelper.debug(
          "[changed] metadataCache hook fired, recounting file",
          file.path
        );
        await this.fileHelper.updateFileCounts(
          file,
          this.savedData.cachedCounts,
          this.settings.wordCountType
        );
        await this.updateDisplayedCounts(file);
        await this.saveSettings();
      })
    );
    const recalculateAll = async (hookName, file) => {
      if (file) {
        this.debugHelper.debug(
          `[${hookName}] vault hook fired by file`,
          file.path,
          "recounting all files"
        );
      } else {
        this.debugHelper.debug(
          `[${hookName}] hook fired`,
          "recounting all files"
        );
      }
      await this.refreshAllCounts();
      await this.updateDisplayedCounts();
    };
    this.registerEvent(
      this.app.vault.on(
        "rename",
        (0, import_obsidian2.debounce)(recalculateAll.bind(this, "rename"), 1e3)
      )
    );
    this.registerEvent(
      this.app.vault.on(
        "create",
        (0, import_obsidian2.debounce)(recalculateAll.bind(this, "create"), 1e3)
      )
    );
    this.registerEvent(
      this.app.vault.on(
        "delete",
        (0, import_obsidian2.debounce)(recalculateAll.bind(this, "delete"), 1e3)
      )
    );
    const reshowCountsIfNeeded = async (hookName) => {
      this.debugHelper.debug(`[${hookName}] hook fired`);
      const fileExplorerLeaf = await this.getFileExplorerLeaf();
      if (this.isContainerTouched(fileExplorerLeaf)) {
        this.debugHelper.debug(
          "container already touched, skipping display update"
        );
        return;
      }
      this.debugHelper.debug("container is clean, updating display");
      await this.updateDisplayedCounts();
    };
    this.registerEvent(
      this.app.workspace.on(
        "layout-change",
        (0, import_obsidian2.debounce)(reshowCountsIfNeeded.bind(this, "layout-change"), 1e3)
      )
    );
  }
  isContainerTouched(leaf) {
    const container = leaf.view.containerEl;
    return container.className.includes("novel-word-count--");
  }
  async refreshAllCounts() {
    this.debugHelper.debug("refreshAllCounts");
    this.savedData.cachedCounts = await this.fileHelper.getAllFileCounts(
      this.settings.wordCountType
    );
    await this.saveSettings();
  }
  setContainerClass(leaf) {
    const container = leaf.view.containerEl;
    const prefix = `novel-word-count--`;
    const alignmentClasses = alignmentTypes.map((at) => prefix + at);
    for (const ac of alignmentClasses) {
      container.toggleClass(ac, false);
    }
    container.toggleClass(prefix + this.settings.alignment, true);
  }
};
var NovelWordCountSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const mainHeader = containerEl.createEl("div", {
      cls: [
        "setting-item",
        "setting-item-heading",
        "novel-word-count-settings-header"
      ]
    });
    mainHeader.createEl("div", { text: "Notes" });
    mainHeader.createEl("div", {
      text: "You can display up to three data types side by side.",
      cls: "setting-item-description"
    });
    new import_obsidian2.Setting(containerEl).setName("1st data type to show").setDesc(getDescription(this.plugin.settings.countType)).addDropdown((drop) => {
      for (const countType of countTypes) {
        drop.addOption(countType, countTypeDisplayStrings[countType]);
      }
      drop.setValue(this.plugin.settings.countType).onChange(async (value) => {
        this.plugin.settings.countType = value;
        await this.plugin.saveSettings();
        await this.plugin.updateDisplayedCounts();
        this.display();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("2nd data type to show").setDesc(getDescription(this.plugin.settings.countType2)).addDropdown((drop) => {
      for (const countType of countTypes) {
        drop.addOption(countType, countTypeDisplayStrings[countType]);
      }
      drop.setValue(this.plugin.settings.countType2).onChange(async (value) => {
        this.plugin.settings.countType2 = value;
        await this.plugin.saveSettings();
        await this.plugin.updateDisplayedCounts();
        this.display();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("3rd data type to show").setDesc(getDescription(this.plugin.settings.countType3)).addDropdown((drop) => {
      for (const countType of countTypes) {
        drop.addOption(countType, countTypeDisplayStrings[countType]);
      }
      drop.setValue(this.plugin.settings.countType3).onChange(async (value) => {
        this.plugin.settings.countType3 = value;
        await this.plugin.saveSettings();
        await this.plugin.updateDisplayedCounts();
        this.display();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Abbreviate descriptions").setDesc("E.g. show '120w' instead of '120 words'").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.abbreviateDescriptions).onChange(async (value) => {
        this.plugin.settings.abbreviateDescriptions = value;
        await this.plugin.saveSettings();
        await this.plugin.updateDisplayedCounts();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Alignment").setDesc(
      "Show data inline with file/folder names, right-aligned, or underneath"
    ).addDropdown((drop) => {
      drop.addOption("inline" /* Inline */, "Inline").addOption("right" /* Right */, "Right-aligned").addOption("below" /* Below */, "Below").setValue(this.plugin.settings.alignment).onChange(async (value) => {
        this.plugin.settings.alignment = value;
        await this.plugin.saveSettings();
        await this.plugin.updateDisplayedCounts();
      });
    });
    containerEl.createEl("div", { text: "Folders" }).addClasses(["setting-item", "setting-item-heading"]);
    new import_obsidian2.Setting(containerEl).setName("Show same data on folders").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showSameCountsOnFolders).onChange(async (value) => {
        this.plugin.settings.showSameCountsOnFolders = value;
        await this.plugin.saveSettings();
        await this.plugin.updateDisplayedCounts();
        this.display();
      })
    );
    if (!this.plugin.settings.showSameCountsOnFolders) {
      new import_obsidian2.Setting(containerEl).setName("1st data type to show").addDropdown((drop) => {
        for (const countType of countTypes) {
          drop.addOption(countType, countTypeDisplayStrings[countType]);
        }
        drop.setValue(this.plugin.settings.folderCountType).onChange(async (value) => {
          this.plugin.settings.folderCountType = value;
          await this.plugin.saveSettings();
          await this.plugin.updateDisplayedCounts();
        });
      });
      new import_obsidian2.Setting(containerEl).setName("2nd data type to show").addDropdown((drop) => {
        for (const countType of countTypes) {
          drop.addOption(countType, countTypeDisplayStrings[countType]);
        }
        drop.setValue(this.plugin.settings.folderCountType2).onChange(async (value) => {
          this.plugin.settings.folderCountType2 = value;
          await this.plugin.saveSettings();
          await this.plugin.updateDisplayedCounts();
        });
      });
      new import_obsidian2.Setting(containerEl).setName("3rd data type to show").addDropdown((drop) => {
        for (const countType of countTypes) {
          drop.addOption(countType, countTypeDisplayStrings[countType]);
        }
        drop.setValue(this.plugin.settings.folderCountType3).onChange(async (value) => {
          this.plugin.settings.folderCountType3 = value;
          await this.plugin.saveSettings();
          await this.plugin.updateDisplayedCounts();
        });
      });
    }
    containerEl.createEl("div", { text: "Advanced" }).addClasses(["setting-item", "setting-item-heading"]);
    new import_obsidian2.Setting(containerEl).setName("Exclude comments").setDesc("Exclude %%comments%% from all counts. May affect performance.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.excludeComments).onChange(async (value) => {
        this.plugin.settings.excludeComments = value;
        await this.plugin.saveSettings();
        await this.plugin.initialize();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Word count method").setDesc("For language compatibility").addDropdown((drop) => {
      drop.addOption(
        "SpaceDelimited" /* SpaceDelimited */,
        "Space-delimited (European languages)"
      ).addOption("CJK" /* CJK */, "Han/Kana/Hangul (CJK)").addOption("AutoDetect" /* AutoDetect */, "Auto-detect by file").setValue(this.plugin.settings.wordCountType).onChange(async (value) => {
        this.plugin.settings.wordCountType = value;
        await this.plugin.saveSettings();
        await this.plugin.initialize();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Page count method").setDesc("For language compatibility").addDropdown((drop) => {
      drop.addOption("ByWords" /* ByWords */, "Words per page").addOption("ByChars" /* ByChars */, "Characters per page").setValue(this.plugin.settings.pageCountType).onChange(async (value) => {
        this.plugin.settings.pageCountType = value;
        await this.plugin.saveSettings();
        await this.plugin.updateDisplayedCounts();
        this.display();
      });
    });
    if (this.plugin.settings.pageCountType === "ByWords" /* ByWords */) {
      const wordsPerPageChanged = async (txt, value) => {
        const asNumber = Number(value);
        const isValid = !isNaN(asNumber) && asNumber > 0;
        txt.inputEl.style.borderColor = isValid ? null : "red";
        this.plugin.settings.wordsPerPage = isValid ? Number(value) : 300;
        await this.plugin.saveSettings();
        await this.plugin.initialize();
      };
      new import_obsidian2.Setting(containerEl).setName("Words per page").setDesc(
        "Used for page count. 300 is standard in English language publishing."
      ).addText((txt) => {
        txt.setPlaceholder("300").setValue(this.plugin.settings.wordsPerPage.toString()).onChange((0, import_obsidian2.debounce)(wordsPerPageChanged.bind(this, txt), 1e3));
      });
    }
    if (this.plugin.settings.pageCountType === "ByChars" /* ByChars */) {
      new import_obsidian2.Setting(containerEl).setName("Include whitespace characters in page count").addToggle(
        (toggle) => toggle.setValue(this.plugin.settings.charsPerPageIncludesWhitespace).onChange(async (value) => {
          this.plugin.settings.charsPerPageIncludesWhitespace = value;
          await this.plugin.saveSettings();
          await this.plugin.initialize();
          this.display();
        })
      );
      const charsPerPageChanged = async (txt, value) => {
        const asNumber = Number(value);
        const isValid = !isNaN(asNumber) && asNumber > 0;
        txt.inputEl.style.borderColor = isValid ? null : "red";
        const defaultCharsPerPage = 1500;
        this.plugin.settings.charsPerPage = isValid ? Number(value) : defaultCharsPerPage;
        await this.plugin.saveSettings();
        await this.plugin.initialize();
      };
      new import_obsidian2.Setting(containerEl).setName("Characters per page").setDesc(
        `Used for page count. ${this.plugin.settings.charsPerPageIncludesWhitespace ? "2400 is common in Danish." : "1500 is common in German (Normseite)."}`
      ).addText((txt) => {
        txt.setPlaceholder("1500").setValue(this.plugin.settings.charsPerPage.toString()).onChange((0, import_obsidian2.debounce)(charsPerPageChanged.bind(this, txt), 1e3));
      });
    }
    new import_obsidian2.Setting(containerEl).setName("Reanalyze all documents").setDesc(
      "If changes have occurred outside of Obsidian, you may need to trigger a manual analysis"
    ).addButton(
      (button) => button.setButtonText("Reanalyze").setCta().onClick(async () => {
        button.disabled = true;
        await this.plugin.initialize();
        button.setButtonText("Done");
        button.removeCta();
        setTimeout(() => {
          button.setButtonText("Reanalyze");
          button.setCta();
          button.disabled = false;
        }, 1e3);
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Debug mode").setDesc("Log debugging information to the developer console").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.debugMode).onChange(async (value) => {
        this.plugin.settings.debugMode = value;
        this.plugin.debugHelper.setDebugMode(value);
        this.plugin.fileHelper.setDebugMode(value);
        await this.plugin.saveSettings();
      })
    );
  }
};
