declare module "node-forge" {
  declare class forge {
    static random: Random;
  }

  declare class Random {
    seedFileSync(needed: number): string;
    getBytes(needed: number): string;
    getBytesSync(needed: number): string;
  }
}

declare module "webworker-threads" {
  declare function Worker(callback: function): void;
}
