const colors = require("ansi-colors");
const log = require("fancy-log");
const OBS = require("./obs");

class OBSPlugin extends OBS {
  constructor(options) {
    super(options);
    this.onSuccess = options.onSuccess || null;
  }

  apply(compiler) {
    if (this.config.accessKeyId && this.config.secretAccessKey) {
      if (!this.config.output && this.config.local) {
        const output = compiler.outputPath || compiler.options.output.path;
        if (output) {
          this.config.output = output;
        } else {
          throw new Error(`请配置配置output`);
        }
      }
      if (compiler.hooks) {
        compiler.hooks.done.tapAsync("OBSPlugin", (compilation, callback) => {
          this.upload(compilation, () => {
            if (typeof this.onSuccess === "function") {
              this.onSuccess();
            }
            callback();
          });
        });
      } else {
        compiler.plugin("done", (compilation, callback) => {
          this.upload(compilation, () => {
            if (typeof this.onSuccess === "function") {
              this.onSuccess();
            }
            callback();
          });
        });
      }
    } else {
      log(colors.red(`请填写正确的accessKeyId、secretAccessKey和bucket`));
    }
  }

  upload(compilation, callback) {
    const { format, deleteAll } = this.config;
    if (compilation) {
      this.assets = compilation.compilation.assets;
    }
    this.uploadAssets(() => {
      if (typeof callback === "function") {
        callback();
      }
    });
  }
}

exports.OBS = OBS;

module.exports = OBSPlugin;
