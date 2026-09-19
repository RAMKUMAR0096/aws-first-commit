// DOMMatrix and Location polyfills for pdfjs-dist in Node.js / Next.js Server Components

class DOMMatrixPolyfill {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  m11 = 1; m12 = 0; m13 = 0; m14 = 0;
  m21 = 0; m22 = 1; m23 = 0; m24 = 0;
  m31 = 0; m32 = 0; m33 = 1; m34 = 0;
  m41 = 0; m42 = 0; m43 = 0; m44 = 1;
  is2D = true;
  isIdentity = true;

  constructor(init?: any) {
    if (Array.isArray(init) && init.length >= 6) {
      this.a = init[0]; this.b = init[1]; this.c = init[2];
      this.d = init[3]; this.e = init[4]; this.f = init[5];
      this.m11 = this.a; this.m12 = this.b; this.m21 = this.c; this.m22 = this.d;
      this.m41 = this.e; this.m42 = this.f;
    }
  }

  multiply() { return this; }
  inverse() { return this; }
  translate() { return this; }
  scale() { return this; }
  rotate() { return this; }
  transformPoint(p?: any) { return p || { x: 0, y: 0, z: 0, w: 1 }; }
  toFloat32Array() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  toFloat64Array() { return new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
}

const g: any = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : {};

// Safe location object to prevent destructuring errors
const safeLocation = {
  protocol: "http:",
  host: "localhost:3000",
  hostname: "localhost",
  port: "3000",
  href: "http://localhost:3000/",
  origin: "http://localhost:3000",
  pathname: "/",
  search: "",
  hash: "",
  assign() { },
  replace() { },
  reload() { },
  toString() { return "http://localhost:3000/"; }
};

// 1. Polyfill DOMMatrix globally
if (typeof g.DOMMatrix === "undefined") {
  g.DOMMatrix = DOMMatrixPolyfill;
}
if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = DOMMatrixPolyfill;
}

// 2. Mock window and window.location completely for Node SSR / Server Components
if (typeof g.window === "undefined") {
  g.window = g;
}

if (typeof g.window.location === "undefined") {
  try {
    Object.defineProperty(g.window, "location", {
      value: safeLocation,
      writable: true,
      configurable: true,
    });
  } catch {
    g.window.location = safeLocation;
  }
}

if (typeof g.location === "undefined") {
  g.location = safeLocation;
}

export { DOMMatrixPolyfill };