import React, { createContext, createElement, Fragment, forwardRef, Component } from 'react';
import PropTypes from 'prop-types';
import isURL from 'validator/lib/isURL';
import camelCase from 'lodash-es/camelCase';
import concat from 'lodash-es/concat';
import debounce from 'lodash-es/debounce';
import difference from 'lodash-es/difference';
import get from 'lodash-es/get';
import isString from 'lodash-es/isString';
import last from 'lodash-es/last';
import map from 'lodash-es/map';
import round from 'lodash-es/round';
import split from 'lodash-es/split';
import upperFirst from 'lodash-es/upperFirst';
import upperCase from 'lodash-es/upperCase';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var inheritsLoose = _inheritsLoose;

/*

Based off glamor's StyleSheet, thanks Sunil ❤️

high performance StyleSheet for css-in-js systems

- uses multiple style tags behind the scenes for millions of rules
- uses `insertRule` for appending in production for *much* faster performance

// usage

import { StyleSheet } from '@emotion/sheet'

let styleSheet = new StyleSheet({ key: '', container: document.head })

styleSheet.insert('#box { border: 1px solid red; }')
- appends a css rule into the stylesheet

styleSheet.flush()
- empties the stylesheet of all its contents

*/
// $FlowFixMe
function sheetForTag(tag) {
  if (tag.sheet) {
    // $FlowFixMe
    return tag.sheet;
  } // this weirdness brought to you by firefox

  /* istanbul ignore next */


  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode === tag) {
      // $FlowFixMe
      return document.styleSheets[i];
    }
  }
}

function createStyleElement(options) {
  var tag = document.createElement('style');
  tag.setAttribute('data-emotion', options.key);

  if (options.nonce !== undefined) {
    tag.setAttribute('nonce', options.nonce);
  }

  tag.appendChild(document.createTextNode(''));
  return tag;
}

var StyleSheet =
/*#__PURE__*/
function () {
  function StyleSheet(options) {
    this.isSpeedy = options.speedy === undefined ? process.env.NODE_ENV === 'production' : options.speedy;
    this.tags = [];
    this.ctr = 0;
    this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets

    this.key = options.key;
    this.container = options.container;
    this.before = null;
  }

  var _proto = StyleSheet.prototype;

  _proto.insert = function insert(rule) {
    // the max length is how many rules we have per style tag, it's 65000 in speedy mode
    // it's 1 in dev because we insert source maps that map a single rule to a location
    // and you can only have one source map per style tag
    if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) {
      var _tag = createStyleElement(this);

      var before;

      if (this.tags.length === 0) {
        before = this.before;
      } else {
        before = this.tags[this.tags.length - 1].nextSibling;
      }

      this.container.insertBefore(_tag, before);
      this.tags.push(_tag);
    }

    var tag = this.tags[this.tags.length - 1];

    if (this.isSpeedy) {
      var sheet = sheetForTag(tag);

      try {
        // this is a really hot path
        // we check the second character first because having "i"
        // as the second character will happen less often than
        // having "@" as the first character
        var isImportRule = rule.charCodeAt(1) === 105 && rule.charCodeAt(0) === 64; // this is the ultrafast version, works across browsers
        // the big drawback is that the css won't be editable in devtools

        sheet.insertRule(rule, // we need to insert @import rules before anything else
        // otherwise there will be an error
        // technically this means that the @import rules will
        // _usually_(not always since there could be multiple style tags)
        // be the first ones in prod and generally later in dev
        // this shouldn't really matter in the real world though
        // @import is generally only used for font faces from google fonts and etc.
        // so while this could be technically correct then it would be slower and larger
        // for a tiny bit of correctness that won't matter in the real world
        isImportRule ? 0 : sheet.cssRules.length);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn("There was a problem inserting the following rule: \"" + rule + "\"", e);
        }
      }
    } else {
      tag.appendChild(document.createTextNode(rule));
    }

    this.ctr++;
  };

  _proto.flush = function flush() {
    // $FlowFixMe
    this.tags.forEach(function (tag) {
      return tag.parentNode.removeChild(tag);
    });
    this.tags = [];
    this.ctr = 0;
  };

  return StyleSheet;
}();

function stylis_min (W) {
  function M(d, c, e, h, a) {
    for (var m = 0, b = 0, v = 0, n = 0, q, g, x = 0, K = 0, k, u = k = q = 0, l = 0, r = 0, I = 0, t = 0, B = e.length, J = B - 1, y, f = '', p = '', F = '', G = '', C; l < B;) {
      g = e.charCodeAt(l);
      l === J && 0 !== b + n + v + m && (0 !== b && (g = 47 === b ? 10 : 47), n = v = m = 0, B++, J++);

      if (0 === b + n + v + m) {
        if (l === J && (0 < r && (f = f.replace(N, '')), 0 < f.trim().length)) {
          switch (g) {
            case 32:
            case 9:
            case 59:
            case 13:
            case 10:
              break;

            default:
              f += e.charAt(l);
          }

          g = 59;
        }

        switch (g) {
          case 123:
            f = f.trim();
            q = f.charCodeAt(0);
            k = 1;

            for (t = ++l; l < B;) {
              switch (g = e.charCodeAt(l)) {
                case 123:
                  k++;
                  break;

                case 125:
                  k--;
                  break;

                case 47:
                  switch (g = e.charCodeAt(l + 1)) {
                    case 42:
                    case 47:
                      a: {
                        for (u = l + 1; u < J; ++u) {
                          switch (e.charCodeAt(u)) {
                            case 47:
                              if (42 === g && 42 === e.charCodeAt(u - 1) && l + 2 !== u) {
                                l = u + 1;
                                break a;
                              }

                              break;

                            case 10:
                              if (47 === g) {
                                l = u + 1;
                                break a;
                              }

                          }
                        }

                        l = u;
                      }

                  }

                  break;

                case 91:
                  g++;

                case 40:
                  g++;

                case 34:
                case 39:
                  for (; l++ < J && e.charCodeAt(l) !== g;) {
                  }

              }

              if (0 === k) break;
              l++;
            }

            k = e.substring(t, l);
            0 === q && (q = (f = f.replace(ca, '').trim()).charCodeAt(0));

            switch (q) {
              case 64:
                0 < r && (f = f.replace(N, ''));
                g = f.charCodeAt(1);

                switch (g) {
                  case 100:
                  case 109:
                  case 115:
                  case 45:
                    r = c;
                    break;

                  default:
                    r = O;
                }

                k = M(c, r, k, g, a + 1);
                t = k.length;
                0 < A && (r = X(O, f, I), C = H(3, k, r, c, D, z, t, g, a, h), f = r.join(''), void 0 !== C && 0 === (t = (k = C.trim()).length) && (g = 0, k = ''));
                if (0 < t) switch (g) {
                  case 115:
                    f = f.replace(da, ea);

                  case 100:
                  case 109:
                  case 45:
                    k = f + '{' + k + '}';
                    break;

                  case 107:
                    f = f.replace(fa, '$1 $2');
                    k = f + '{' + k + '}';
                    k = 1 === w || 2 === w && L('@' + k, 3) ? '@-webkit-' + k + '@' + k : '@' + k;
                    break;

                  default:
                    k = f + k, 112 === h && (k = (p += k, ''));
                } else k = '';
                break;

              default:
                k = M(c, X(c, f, I), k, h, a + 1);
            }

            F += k;
            k = I = r = u = q = 0;
            f = '';
            g = e.charCodeAt(++l);
            break;

          case 125:
          case 59:
            f = (0 < r ? f.replace(N, '') : f).trim();
            if (1 < (t = f.length)) switch (0 === u && (q = f.charCodeAt(0), 45 === q || 96 < q && 123 > q) && (t = (f = f.replace(' ', ':')).length), 0 < A && void 0 !== (C = H(1, f, c, d, D, z, p.length, h, a, h)) && 0 === (t = (f = C.trim()).length) && (f = '\x00\x00'), q = f.charCodeAt(0), g = f.charCodeAt(1), q) {
              case 0:
                break;

              case 64:
                if (105 === g || 99 === g) {
                  G += f + e.charAt(l);
                  break;
                }

              default:
                58 !== f.charCodeAt(t - 1) && (p += P(f, q, g, f.charCodeAt(2)));
            }
            I = r = u = q = 0;
            f = '';
            g = e.charCodeAt(++l);
        }
      }

      switch (g) {
        case 13:
        case 10:
          47 === b ? b = 0 : 0 === 1 + q && 107 !== h && 0 < f.length && (r = 1, f += '\x00');
          0 < A * Y && H(0, f, c, d, D, z, p.length, h, a, h);
          z = 1;
          D++;
          break;

        case 59:
        case 125:
          if (0 === b + n + v + m) {
            z++;
            break;
          }

        default:
          z++;
          y = e.charAt(l);

          switch (g) {
            case 9:
            case 32:
              if (0 === n + m + b) switch (x) {
                case 44:
                case 58:
                case 9:
                case 32:
                  y = '';
                  break;

                default:
                  32 !== g && (y = ' ');
              }
              break;

            case 0:
              y = '\\0';
              break;

            case 12:
              y = '\\f';
              break;

            case 11:
              y = '\\v';
              break;

            case 38:
              0 === n + b + m && (r = I = 1, y = '\f' + y);
              break;

            case 108:
              if (0 === n + b + m + E && 0 < u) switch (l - u) {
                case 2:
                  112 === x && 58 === e.charCodeAt(l - 3) && (E = x);

                case 8:
                  111 === K && (E = K);
              }
              break;

            case 58:
              0 === n + b + m && (u = l);
              break;

            case 44:
              0 === b + v + n + m && (r = 1, y += '\r');
              break;

            case 34:
            case 39:
              0 === b && (n = n === g ? 0 : 0 === n ? g : n);
              break;

            case 91:
              0 === n + b + v && m++;
              break;

            case 93:
              0 === n + b + v && m--;
              break;

            case 41:
              0 === n + b + m && v--;
              break;

            case 40:
              if (0 === n + b + m) {
                if (0 === q) switch (2 * x + 3 * K) {
                  case 533:
                    break;

                  default:
                    q = 1;
                }
                v++;
              }

              break;

            case 64:
              0 === b + v + n + m + u + k && (k = 1);
              break;

            case 42:
            case 47:
              if (!(0 < n + m + v)) switch (b) {
                case 0:
                  switch (2 * g + 3 * e.charCodeAt(l + 1)) {
                    case 235:
                      b = 47;
                      break;

                    case 220:
                      t = l, b = 42;
                  }

                  break;

                case 42:
                  47 === g && 42 === x && t + 2 !== l && (33 === e.charCodeAt(t + 2) && (p += e.substring(t, l + 1)), y = '', b = 0);
              }
          }

          0 === b && (f += y);
      }

      K = x;
      x = g;
      l++;
    }

    t = p.length;

    if (0 < t) {
      r = c;
      if (0 < A && (C = H(2, p, r, d, D, z, t, h, a, h), void 0 !== C && 0 === (p = C).length)) return G + p + F;
      p = r.join(',') + '{' + p + '}';

      if (0 !== w * E) {
        2 !== w || L(p, 2) || (E = 0);

        switch (E) {
          case 111:
            p = p.replace(ha, ':-moz-$1') + p;
            break;

          case 112:
            p = p.replace(Q, '::-webkit-input-$1') + p.replace(Q, '::-moz-$1') + p.replace(Q, ':-ms-input-$1') + p;
        }

        E = 0;
      }
    }

    return G + p + F;
  }

  function X(d, c, e) {
    var h = c.trim().split(ia);
    c = h;
    var a = h.length,
        m = d.length;

    switch (m) {
      case 0:
      case 1:
        var b = 0;

        for (d = 0 === m ? '' : d[0] + ' '; b < a; ++b) {
          c[b] = Z(d, c[b], e).trim();
        }

        break;

      default:
        var v = b = 0;

        for (c = []; b < a; ++b) {
          for (var n = 0; n < m; ++n) {
            c[v++] = Z(d[n] + ' ', h[b], e).trim();
          }
        }

    }

    return c;
  }

  function Z(d, c, e) {
    var h = c.charCodeAt(0);
    33 > h && (h = (c = c.trim()).charCodeAt(0));

    switch (h) {
      case 38:
        return c.replace(F, '$1' + d.trim());

      case 58:
        return d.trim() + c.replace(F, '$1' + d.trim());

      default:
        if (0 < 1 * e && 0 < c.indexOf('\f')) return c.replace(F, (58 === d.charCodeAt(0) ? '' : '$1') + d.trim());
    }

    return d + c;
  }

  function P(d, c, e, h) {
    var a = d + ';',
        m = 2 * c + 3 * e + 4 * h;

    if (944 === m) {
      d = a.indexOf(':', 9) + 1;
      var b = a.substring(d, a.length - 1).trim();
      b = a.substring(0, d).trim() + b + ';';
      return 1 === w || 2 === w && L(b, 1) ? '-webkit-' + b + b : b;
    }

    if (0 === w || 2 === w && !L(a, 1)) return a;

    switch (m) {
      case 1015:
        return 97 === a.charCodeAt(10) ? '-webkit-' + a + a : a;

      case 951:
        return 116 === a.charCodeAt(3) ? '-webkit-' + a + a : a;

      case 963:
        return 110 === a.charCodeAt(5) ? '-webkit-' + a + a : a;

      case 1009:
        if (100 !== a.charCodeAt(4)) break;

      case 969:
      case 942:
        return '-webkit-' + a + a;

      case 978:
        return '-webkit-' + a + '-moz-' + a + a;

      case 1019:
      case 983:
        return '-webkit-' + a + '-moz-' + a + '-ms-' + a + a;

      case 883:
        if (45 === a.charCodeAt(8)) return '-webkit-' + a + a;
        if (0 < a.indexOf('image-set(', 11)) return a.replace(ja, '$1-webkit-$2') + a;
        break;

      case 932:
        if (45 === a.charCodeAt(4)) switch (a.charCodeAt(5)) {
          case 103:
            return '-webkit-box-' + a.replace('-grow', '') + '-webkit-' + a + '-ms-' + a.replace('grow', 'positive') + a;

          case 115:
            return '-webkit-' + a + '-ms-' + a.replace('shrink', 'negative') + a;

          case 98:
            return '-webkit-' + a + '-ms-' + a.replace('basis', 'preferred-size') + a;
        }
        return '-webkit-' + a + '-ms-' + a + a;

      case 964:
        return '-webkit-' + a + '-ms-flex-' + a + a;

      case 1023:
        if (99 !== a.charCodeAt(8)) break;
        b = a.substring(a.indexOf(':', 15)).replace('flex-', '').replace('space-between', 'justify');
        return '-webkit-box-pack' + b + '-webkit-' + a + '-ms-flex-pack' + b + a;

      case 1005:
        return ka.test(a) ? a.replace(aa, ':-webkit-') + a.replace(aa, ':-moz-') + a : a;

      case 1e3:
        b = a.substring(13).trim();
        c = b.indexOf('-') + 1;

        switch (b.charCodeAt(0) + b.charCodeAt(c)) {
          case 226:
            b = a.replace(G, 'tb');
            break;

          case 232:
            b = a.replace(G, 'tb-rl');
            break;

          case 220:
            b = a.replace(G, 'lr');
            break;

          default:
            return a;
        }

        return '-webkit-' + a + '-ms-' + b + a;

      case 1017:
        if (-1 === a.indexOf('sticky', 9)) break;

      case 975:
        c = (a = d).length - 10;
        b = (33 === a.charCodeAt(c) ? a.substring(0, c) : a).substring(d.indexOf(':', 7) + 1).trim();

        switch (m = b.charCodeAt(0) + (b.charCodeAt(7) | 0)) {
          case 203:
            if (111 > b.charCodeAt(8)) break;

          case 115:
            a = a.replace(b, '-webkit-' + b) + ';' + a;
            break;

          case 207:
          case 102:
            a = a.replace(b, '-webkit-' + (102 < m ? 'inline-' : '') + 'box') + ';' + a.replace(b, '-webkit-' + b) + ';' + a.replace(b, '-ms-' + b + 'box') + ';' + a;
        }

        return a + ';';

      case 938:
        if (45 === a.charCodeAt(5)) switch (a.charCodeAt(6)) {
          case 105:
            return b = a.replace('-items', ''), '-webkit-' + a + '-webkit-box-' + b + '-ms-flex-' + b + a;

          case 115:
            return '-webkit-' + a + '-ms-flex-item-' + a.replace(ba, '') + a;

          default:
            return '-webkit-' + a + '-ms-flex-line-pack' + a.replace('align-content', '').replace(ba, '') + a;
        }
        break;

      case 973:
      case 989:
        if (45 !== a.charCodeAt(3) || 122 === a.charCodeAt(4)) break;

      case 931:
      case 953:
        if (!0 === la.test(d)) return 115 === (b = d.substring(d.indexOf(':') + 1)).charCodeAt(0) ? P(d.replace('stretch', 'fill-available'), c, e, h).replace(':fill-available', ':stretch') : a.replace(b, '-webkit-' + b) + a.replace(b, '-moz-' + b.replace('fill-', '')) + a;
        break;

      case 962:
        if (a = '-webkit-' + a + (102 === a.charCodeAt(5) ? '-ms-' + a : '') + a, 211 === e + h && 105 === a.charCodeAt(13) && 0 < a.indexOf('transform', 10)) return a.substring(0, a.indexOf(';', 27) + 1).replace(ma, '$1-webkit-$2') + a;
    }

    return a;
  }

  function L(d, c) {
    var e = d.indexOf(1 === c ? ':' : '{'),
        h = d.substring(0, 3 !== c ? e : 10);
    e = d.substring(e + 1, d.length - 1);
    return R(2 !== c ? h : h.replace(na, '$1'), e, c);
  }

  function ea(d, c) {
    var e = P(c, c.charCodeAt(0), c.charCodeAt(1), c.charCodeAt(2));
    return e !== c + ';' ? e.replace(oa, ' or ($1)').substring(4) : '(' + c + ')';
  }

  function H(d, c, e, h, a, m, b, v, n, q) {
    for (var g = 0, x = c, w; g < A; ++g) {
      switch (w = S[g].call(B, d, x, e, h, a, m, b, v, n, q)) {
        case void 0:
        case !1:
        case !0:
        case null:
          break;

        default:
          x = w;
      }
    }

    if (x !== c) return x;
  }

  function T(d) {
    switch (d) {
      case void 0:
      case null:
        A = S.length = 0;
        break;

      default:
        if ('function' === typeof d) S[A++] = d;else if ('object' === typeof d) for (var c = 0, e = d.length; c < e; ++c) {
          T(d[c]);
        } else Y = !!d | 0;
    }

    return T;
  }

  function U(d) {
    d = d.prefix;
    void 0 !== d && (R = null, d ? 'function' !== typeof d ? w = 1 : (w = 2, R = d) : w = 0);
    return U;
  }

  function B(d, c) {
    var e = d;
    33 > e.charCodeAt(0) && (e = e.trim());
    V = e;
    e = [V];

    if (0 < A) {
      var h = H(-1, c, e, e, D, z, 0, 0, 0, 0);
      void 0 !== h && 'string' === typeof h && (c = h);
    }

    var a = M(O, e, c, 0, 0);
    0 < A && (h = H(-2, a, e, e, D, z, a.length, 0, 0, 0), void 0 !== h && (a = h));
    V = '';
    E = 0;
    z = D = 1;
    return a;
  }

  var ca = /^\0+/g,
      N = /[\0\r\f]/g,
      aa = /: */g,
      ka = /zoo|gra/,
      ma = /([,: ])(transform)/g,
      ia = /,\r+?/g,
      F = /([\t\r\n ])*\f?&/g,
      fa = /@(k\w+)\s*(\S*)\s*/,
      Q = /::(place)/g,
      ha = /:(read-only)/g,
      G = /[svh]\w+-[tblr]{2}/,
      da = /\(\s*(.*)\s*\)/g,
      oa = /([\s\S]*?);/g,
      ba = /-self|flex-/g,
      na = /[^]*?(:[rp][el]a[\w-]+)[^]*/,
      la = /stretch|:\s*\w+\-(?:conte|avail)/,
      ja = /([^-])(image-set\()/,
      z = 1,
      D = 1,
      E = 0,
      w = 1,
      O = [],
      S = [],
      A = 0,
      R = null,
      Y = 0,
      V = '';
  B.use = T;
  B.set = U;
  void 0 !== W && U(W);
  return B;
}

var weakMemoize = function weakMemoize(func) {
  // $FlowFixMe flow doesn't include all non-primitive types as allowed for weakmaps
  var cache = new WeakMap();
  return function (arg) {
    if (cache.has(arg)) {
      // $FlowFixMe
      return cache.get(arg);
    }

    var ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
};

// https://github.com/thysultan/stylis.js/tree/master/plugins/rule-sheet
// inlined to avoid umd wrapper and peerDep warnings/installing stylis
// since we use stylis after closure compiler
var delimiter = '/*|*/';
var needle = delimiter + '}';

function toSheet(block) {
  if (block) {
    Sheet.current.insert(block + '}');
  }
}

var Sheet = {
  current: null
};
var ruleSheet = function ruleSheet(context, content, selectors, parents, line, column, length, ns, depth, at) {
  switch (context) {
    // property
    case 1:
      {
        switch (content.charCodeAt(0)) {
          case 64:
            {
              // @import
              Sheet.current.insert(content + ';');
              return '';
            }
          // charcode for l

          case 108:
            {
              // charcode for b
              // this ignores label
              if (content.charCodeAt(2) === 98) {
                return '';
              }
            }
        }

        break;
      }
    // selector

    case 2:
      {
        if (ns === 0) return content + delimiter;
        break;
      }
    // at-rule

    case 3:
      {
        switch (ns) {
          // @font-face, @page
          case 102:
          case 112:
            {
              Sheet.current.insert(selectors[0] + content);
              return '';
            }

          default:
            {
              return content + (at === 0 ? delimiter : '');
            }
        }
      }

    case -2:
      {
        content.split(needle).forEach(toSheet);
      }
  }
};
var removeLabel = function removeLabel(context, content) {
  if (context === 1 && // charcode for l
  content.charCodeAt(0) === 108 && // charcode for b
  content.charCodeAt(2) === 98 // this ignores label
  ) {
      return '';
    }
};

var isBrowser = typeof document !== 'undefined';
var rootServerStylisCache = {};
var getServerStylisCache = isBrowser ? undefined : weakMemoize(function () {
  var getCache = weakMemoize(function () {
    return {};
  });
  var prefixTrueCache = {};
  var prefixFalseCache = {};
  return function (prefix) {
    if (prefix === undefined || prefix === true) {
      return prefixTrueCache;
    }

    if (prefix === false) {
      return prefixFalseCache;
    }

    return getCache(prefix);
  };
});

var createCache = function createCache(options) {
  if (options === undefined) options = {};
  var key = options.key || 'css';
  var stylisOptions;

  if (options.prefix !== undefined) {
    stylisOptions = {
      prefix: options.prefix
    };
  }

  var stylis = new stylis_min(stylisOptions);

  if (process.env.NODE_ENV !== 'production') {
    // $FlowFixMe
    if (/[^a-z-]/.test(key)) {
      throw new Error("Emotion key must only contain lower case alphabetical characters and - but \"" + key + "\" was passed");
    }
  }

  var inserted = {}; // $FlowFixMe

  var container;

  if (isBrowser) {
    container = options.container || document.head;
    var nodes = document.querySelectorAll("style[data-emotion-" + key + "]");
    Array.prototype.forEach.call(nodes, function (node) {
      var attrib = node.getAttribute("data-emotion-" + key); // $FlowFixMe

      attrib.split(' ').forEach(function (id) {
        inserted[id] = true;
      });

      if (node.parentNode !== container) {
        container.appendChild(node);
      }
    });
  }

  var _insert;

  if (isBrowser) {
    stylis.use(options.stylisPlugins)(ruleSheet);

    _insert = function insert(selector, serialized, sheet, shouldCache) {
      var name = serialized.name;
      Sheet.current = sheet;

      if (process.env.NODE_ENV !== 'production' && serialized.map !== undefined) {
        var map = serialized.map;
        Sheet.current = {
          insert: function insert(rule) {
            sheet.insert(rule + map);
          }
        };
      }

      stylis(selector, serialized.styles);

      if (shouldCache) {
        cache.inserted[name] = true;
      }
    };
  } else {
    stylis.use(removeLabel);
    var serverStylisCache = rootServerStylisCache;

    if (options.stylisPlugins || options.prefix !== undefined) {
      stylis.use(options.stylisPlugins); // $FlowFixMe

      serverStylisCache = getServerStylisCache(options.stylisPlugins || rootServerStylisCache)(options.prefix);
    }

    var getRules = function getRules(selector, serialized) {
      var name = serialized.name;

      if (serverStylisCache[name] === undefined) {
        serverStylisCache[name] = stylis(selector, serialized.styles);
      }

      return serverStylisCache[name];
    };

    _insert = function _insert(selector, serialized, sheet, shouldCache) {
      var name = serialized.name;
      var rules = getRules(selector, serialized);

      if (cache.compat === undefined) {
        // in regular mode, we don't set the styles on the inserted cache
        // since we don't need to and that would be wasting memory
        // we return them so that they are rendered in a style tag
        if (shouldCache) {
          cache.inserted[name] = true;
        }

        if ( // using === development instead of !== production
        // because if people do ssr in tests, the source maps showing up would be annoying
        process.env.NODE_ENV === 'development' && serialized.map !== undefined) {
          return rules + serialized.map;
        }

        return rules;
      } else {
        // in compat mode, we put the styles on the inserted cache so
        // that emotion-server can pull out the styles
        // except when we don't want to cache it which was in Global but now
        // is nowhere but we don't want to do a major right now
        // and just in case we're going to leave the case here
        // it's also not affecting client side bundle size
        // so it's really not a big deal
        if (shouldCache) {
          cache.inserted[name] = rules;
        } else {
          return rules;
        }
      }
    };
  }

  if (process.env.NODE_ENV !== 'production') {
    // https://esbench.com/bench/5bf7371a4cd7e6009ef61d0a
    var commentStart = /\/\*/g;
    var commentEnd = /\*\//g;
    stylis.use(function (context, content) {
      switch (context) {
        case -1:
          {
            while (commentStart.test(content)) {
              commentEnd.lastIndex = commentStart.lastIndex;

              if (commentEnd.test(content)) {
                commentStart.lastIndex = commentEnd.lastIndex;
                continue;
              }

              throw new Error('Your styles have an unterminated comment ("/*" without corresponding "*/").');
            }

            commentStart.lastIndex = 0;
            break;
          }
      }
    });
    stylis.use(function (context, content, selectors) {
      switch (context) {
        case -1:
          {
            var flag = 'emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason';
            var unsafePseudoClasses = content.match(/(:first|:nth|:nth-last)-child/g);

            if (unsafePseudoClasses && cache.compat !== true) {
              unsafePseudoClasses.forEach(function (unsafePseudoClass) {
                var ignoreRegExp = new RegExp(unsafePseudoClass + ".*\\/\\* " + flag + " \\*\\/");
                var ignore = ignoreRegExp.test(content);

                if (unsafePseudoClass && !ignore) {
                  console.error("The pseudo class \"" + unsafePseudoClass + "\" is potentially unsafe when doing server-side rendering. Try changing it to \"" + unsafePseudoClass.split('-child')[0] + "-of-type\".");
                }
              });
            }

            break;
          }
      }
    });
  }

  var cache = {
    key: key,
    sheet: new StyleSheet({
      key: key,
      container: container,
      nonce: options.nonce,
      speedy: options.speedy
    }),
    nonce: options.nonce,
    inserted: inserted,
    registered: {},
    insert: _insert
  };
  return cache;
};

var isBrowser$1 = typeof document !== 'undefined';
function getRegisteredStyles(registered, registeredStyles, classNames) {
  var rawClassName = '';
  classNames.split(' ').forEach(function (className) {
    if (registered[className] !== undefined) {
      registeredStyles.push(registered[className]);
    } else {
      rawClassName += className + " ";
    }
  });
  return rawClassName;
}
var insertStyles = function insertStyles(cache, serialized, isStringTag) {
  var className = cache.key + "-" + serialized.name;

  if ( // we only need to add the styles to the registered cache if the
  // class name could be used further down
  // the tree but if it's a string tag, we know it won't
  // so we don't have to add it to registered cache.
  // this improves memory usage since we can avoid storing the whole style string
  (isStringTag === false || // we need to always store it if we're in compat mode and
  // in node since emotion-server relies on whether a style is in
  // the registered cache to know whether a style is global or not
  // also, note that this check will be dead code eliminated in the browser
  isBrowser$1 === false && cache.compat !== undefined) && cache.registered[className] === undefined) {
    cache.registered[className] = serialized.styles;
  }

  if (cache.inserted[serialized.name] === undefined) {
    var stylesForSSR = '';
    var current = serialized;

    do {
      var maybeStyles = cache.insert("." + className, current, cache.sheet, true);

      if (!isBrowser$1 && maybeStyles !== undefined) {
        stylesForSSR += maybeStyles;
      }

      current = current.next;
    } while (current !== undefined);

    if (!isBrowser$1 && stylesForSSR.length !== 0) {
      return stylesForSSR;
    }
  }
};

/* eslint-disable */
// murmurhash2 via https://github.com/garycourt/murmurhash-js/blob/master/murmurhash2_gc.js
function murmurhash2_32_gc(str) {
  var l = str.length,
      h = l ^ l,
      i = 0,
      k;

  while (l >= 4) {
    k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    k ^= k >>> 24;
    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;
    l -= 4;
    ++i;
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
  }

  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
  h ^= h >>> 15;
  return (h >>> 0).toString(36);
}

var unitlessKeys = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};

function memoize(fn) {
  var cache = {};
  return function (arg) {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

var ILLEGAL_ESCAPE_SEQUENCE_ERROR = "You have illegal escape sequence in your template literal, most likely inside content's property value.\nBecause you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \"content: '\\00d7';\" should become \"content: '\\\\00d7';\".\nYou can read more about this here:\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences";
var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
var hyphenateRegex = /[A-Z]|^ms/g;
var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;

var isCustomProperty = function isCustomProperty(property) {
  return property.charCodeAt(1) === 45;
};

var isProcessableValue = function isProcessableValue(value) {
  return value != null && typeof value !== 'boolean';
};

var processStyleName = memoize(function (styleName) {
  return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
});

var processStyleValue = function processStyleValue(key, value) {
  switch (key) {
    case 'animation':
    case 'animationName':
      {
        if (typeof value === 'string') {
          return value.replace(animationRegex, function (match, p1, p2) {
            cursor = {
              name: p1,
              styles: p2,
              next: cursor
            };
            return p1;
          });
        }
      }
  }

  if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) {
    return value + 'px';
  }

  return value;
};

if (process.env.NODE_ENV !== 'production') {
  var contentValuePattern = /(attr|calc|counters?|url)\(/;
  var contentValues = ['normal', 'none', 'counter', 'open-quote', 'close-quote', 'no-open-quote', 'no-close-quote', 'initial', 'inherit', 'unset'];
  var oldProcessStyleValue = processStyleValue;
  var msPattern = /^-ms-/;
  var hyphenPattern = /-(.)/g;
  var hyphenatedCache = {};

  processStyleValue = function processStyleValue(key, value) {
    if (key === 'content') {
      if (typeof value !== 'string' || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
        console.error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
      }
    }

    var processed = oldProcessStyleValue(key, value);

    if (processed !== '' && !isCustomProperty(key) && key.indexOf('-') !== -1 && hyphenatedCache[key] === undefined) {
      hyphenatedCache[key] = true;
      console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, 'ms-').replace(hyphenPattern, function (str, _char) {
        return _char.toUpperCase();
      }) + "?");
    }

    return processed;
  };
}

var shouldWarnAboutInterpolatingClassNameFromCss = true;

function handleInterpolation(mergedProps, registered, interpolation, couldBeSelectorInterpolation) {
  if (interpolation == null) {
    return '';
  }

  if (interpolation.__emotion_styles !== undefined) {
    if (process.env.NODE_ENV !== 'production' && interpolation.toString() === 'NO_COMPONENT_SELECTOR') {
      throw new Error('Component selectors can only be used in conjunction with babel-plugin-emotion.');
    }

    return interpolation;
  }

  switch (typeof interpolation) {
    case 'boolean':
      {
        return '';
      }

    case 'object':
      {
        if (interpolation.anim === 1) {
          cursor = {
            name: interpolation.name,
            styles: interpolation.styles,
            next: cursor
          };
          return interpolation.name;
        }

        if (interpolation.styles !== undefined) {
          var next = interpolation.next;

          if (next !== undefined) {
            // not the most efficient thing ever but this is a pretty rare case
            // and there will be very few iterations of this generally
            while (next !== undefined) {
              cursor = {
                name: next.name,
                styles: next.styles,
                next: cursor
              };
              next = next.next;
            }
          }

          var styles = interpolation.styles + ";";

          if (process.env.NODE_ENV !== 'production' && interpolation.map !== undefined) {
            styles += interpolation.map;
          }

          return styles;
        }

        return createStringFromObject(mergedProps, registered, interpolation);
      }

    case 'function':
      {
        if (mergedProps !== undefined) {
          var previousCursor = cursor;
          var result = interpolation(mergedProps);
          cursor = previousCursor;
          return handleInterpolation(mergedProps, registered, result, couldBeSelectorInterpolation);
        } else if (process.env.NODE_ENV !== 'production') {
          console.error('Functions that are interpolated in css calls will be stringified.\n' + 'If you want to have a css call based on props, create a function that returns a css call like this\n' + 'let dynamicStyle = (props) => css`color: ${props.color}`\n' + 'It can be called directly with props or interpolated in a styled call like this\n' + "let SomeComponent = styled('div')`${dynamicStyle}`");
        }

        break;
      }

    case 'string':
      if (process.env.NODE_ENV !== 'production') {
        var matched = [];
        var replaced = interpolation.replace(animationRegex, function (match, p1, p2) {
          var fakeVarName = "animation" + matched.length;
          matched.push("const " + fakeVarName + " = keyframes`" + p2.replace(/^@keyframes animation-\w+/, '') + "`");
          return "${" + fakeVarName + "}";
        });

        if (matched.length) {
          console.error('`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\n' + 'Instead of doing this:\n\n' + [].concat(matched, ["`" + replaced + "`"]).join('\n') + '\n\nYou should wrap it with `css` like this:\n\n' + ("css`" + replaced + "`"));
        }
      }

      break;
  } // finalize string values (regular strings and functions interpolated into css calls)


  if (registered == null) {
    return interpolation;
  }

  var cached = registered[interpolation];

  if (process.env.NODE_ENV !== 'production' && couldBeSelectorInterpolation && shouldWarnAboutInterpolatingClassNameFromCss && cached !== undefined) {
    console.error('Interpolating a className from css`` is not recommended and will cause problems with composition.\n' + 'Interpolating a className from css`` will be completely unsupported in a future major version of Emotion');
    shouldWarnAboutInterpolatingClassNameFromCss = false;
  }

  return cached !== undefined && !couldBeSelectorInterpolation ? cached : interpolation;
}

function createStringFromObject(mergedProps, registered, obj) {
  var string = '';

  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      string += handleInterpolation(mergedProps, registered, obj[i], false);
    }
  } else {
    for (var _key in obj) {
      var value = obj[_key];

      if (typeof value !== 'object') {
        if (registered != null && registered[value] !== undefined) {
          string += _key + "{" + registered[value] + "}";
        } else if (isProcessableValue(value)) {
          string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
        }
      } else {
        if (_key === 'NO_COMPONENT_SELECTOR' && process.env.NODE_ENV !== 'production') {
          throw new Error('Component selectors can only be used in conjunction with babel-plugin-emotion.');
        }

        if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
          for (var _i = 0; _i < value.length; _i++) {
            if (isProcessableValue(value[_i])) {
              string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
            }
          }
        } else {
          var interpolated = handleInterpolation(mergedProps, registered, value, false);

          switch (_key) {
            case 'animation':
            case 'animationName':
              {
                string += processStyleName(_key) + ":" + interpolated + ";";
                break;
              }

            default:
              {
                if (process.env.NODE_ENV !== 'production' && _key === 'undefined') {
                  console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
                }

                string += _key + "{" + interpolated + "}";
              }
          }
        }
      }
    }
  }

  return string;
}

var labelPattern = /label:\s*([^\s;\n{]+)\s*;/g;
var sourceMapPattern;

if (process.env.NODE_ENV !== 'production') {
  sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//;
} // this is the cursor for keyframes
// keyframes are stored on the SerializedStyles object as a linked list


var cursor;
var serializeStyles = function serializeStyles(args, registered, mergedProps) {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) {
    return args[0];
  }

  var stringMode = true;
  var styles = '';
  cursor = undefined;
  var strings = args[0];

  if (strings == null || strings.raw === undefined) {
    stringMode = false;
    styles += handleInterpolation(mergedProps, registered, strings, false);
  } else {
    if (process.env.NODE_ENV !== 'production' && strings[0] === undefined) {
      console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
    }

    styles += strings[0];
  } // we start at 1 since we've already handled the first arg


  for (var i = 1; i < args.length; i++) {
    styles += handleInterpolation(mergedProps, registered, args[i], styles.charCodeAt(styles.length - 1) === 46);

    if (stringMode) {
      if (process.env.NODE_ENV !== 'production' && strings[i] === undefined) {
        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
      }

      styles += strings[i];
    }
  }

  var sourceMap;

  if (process.env.NODE_ENV !== 'production') {
    styles = styles.replace(sourceMapPattern, function (match) {
      sourceMap = match;
      return '';
    });
  } // using a global regex with .exec is stateful so lastIndex has to be reset each time


  labelPattern.lastIndex = 0;
  var identifierName = '';
  var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5

  while ((match = labelPattern.exec(styles)) !== null) {
    identifierName += '-' + // $FlowFixMe we know it's not null
    match[1];
  }

  var name = murmurhash2_32_gc(styles) + identifierName;

  if (process.env.NODE_ENV !== 'production') {
    // $FlowFixMe SerializedStyles type doesn't have toString property (and we don't want to add it)
    return {
      name: name,
      styles: styles,
      map: sourceMap,
      next: cursor,
      toString: function toString() {
        return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
      }
    };
  }

  return {
    name: name,
    styles: styles,
    next: cursor
  };
};

function css() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return serializeStyles(args);
}

var isBrowser$2 = typeof document !== 'undefined';

var EmotionCacheContext = createContext( // we're doing this to avoid preconstruct's dead code elimination in this one case
// because this module is primarily intended for the browser and node
// but it's also required in react native and similar environments sometimes
// and we could have a special build just for that
// but this is much easier and the native packages
// might use a different theme context in the future anyway
typeof HTMLElement !== 'undefined' ? createCache() : null);
var ThemeContext = createContext({});
var CacheProvider = EmotionCacheContext.Provider;

var withEmotionCache = function withEmotionCache(func) {
  var render = function render(props, ref) {
    return createElement(EmotionCacheContext.Consumer, null, function (cache) {
      return func(props, cache, ref);
    });
  }; // $FlowFixMe


  return forwardRef(render);
};

if (!isBrowser$2) {
  var BasicProvider =
  /*#__PURE__*/
  function (_React$Component) {
    inheritsLoose(BasicProvider, _React$Component);

    function BasicProvider(props, context, updater) {
      var _this;

      _this = _React$Component.call(this, props, context, updater) || this;
      _this.state = {
        value: createCache()
      };
      return _this;
    }

    var _proto = BasicProvider.prototype;

    _proto.render = function render() {
      return createElement(EmotionCacheContext.Provider, this.state, this.props.children(this.state.value));
    };

    return BasicProvider;
  }(Component);

  withEmotionCache = function withEmotionCache(func) {
    return function (props) {
      return createElement(EmotionCacheContext.Consumer, null, function (context) {
        if (context === null) {
          return createElement(BasicProvider, null, function (newContext) {
            return func(props, newContext);
          });
        } else {
          return func(props, context);
        }
      });
    };
  };
}

// thus we only need to replace what is a valid character for JS, but not for CSS

var sanitizeIdentifier = function sanitizeIdentifier(identifier) {
  return identifier.replace(/\$/g, '-');
};

var typePropName = '__EMOTION_TYPE_PLEASE_DO_NOT_USE__';
var labelPropName = '__EMOTION_LABEL_PLEASE_DO_NOT_USE__';
var hasOwnProperty = Object.prototype.hasOwnProperty;

var render = function render(cache, props, theme, ref) {
  var cssProp = theme === null ? props.css : props.css(theme); // so that using `css` from `emotion` and passing the result to the css prop works
  // not passing the registered cache to serializeStyles because it would
  // make certain babel optimisations not possible

  if (typeof cssProp === 'string' && cache.registered[cssProp] !== undefined) {
    cssProp = cache.registered[cssProp];
  }

  var type = props[typePropName];
  var registeredStyles = [cssProp];
  var className = '';

  if (typeof props.className === 'string') {
    className = getRegisteredStyles(cache.registered, registeredStyles, props.className);
  } else if (props.className != null) {
    className = props.className + " ";
  }

  var serialized = serializeStyles(registeredStyles);

  if (process.env.NODE_ENV !== 'production' && serialized.name.indexOf('-') === -1) {
    var labelFromStack = props[labelPropName];

    if (labelFromStack) {
      serialized = serializeStyles([serialized, 'label:' + labelFromStack + ';']);
    }
  }

  var rules = insertStyles(cache, serialized, typeof type === 'string');
  className += cache.key + "-" + serialized.name;
  var newProps = {};

  for (var key in props) {
    if (hasOwnProperty.call(props, key) && key !== 'css' && key !== typePropName && (process.env.NODE_ENV === 'production' || key !== labelPropName)) {
      newProps[key] = props[key];
    }
  }

  newProps.ref = ref;
  newProps.className = className;
  var ele = createElement(type, newProps);

  if (!isBrowser$2 && rules !== undefined) {
    var _ref;

    var serializedNames = serialized.name;
    var next = serialized.next;

    while (next !== undefined) {
      serializedNames += ' ' + next.name;
      next = next.next;
    }

    return createElement(Fragment, null, createElement("style", (_ref = {}, _ref["data-emotion-" + cache.key] = serializedNames, _ref.dangerouslySetInnerHTML = {
      __html: rules
    }, _ref.nonce = cache.sheet.nonce, _ref)), ele);
  }

  return ele;
};

var Emotion =
/* #__PURE__ */
withEmotionCache(function (props, cache, ref) {
  // use Context.read for the theme when it's stable
  if (typeof props.css === 'function') {
    return createElement(ThemeContext.Consumer, null, function (theme) {
      return render(cache, props, theme, ref);
    });
  }

  return render(cache, props, null, ref);
});

if (process.env.NODE_ENV !== 'production') {
  Emotion.displayName = 'EmotionCssPropInternal';
} // $FlowFixMe


var jsx = function jsx(type, props) {
  var args = arguments;

  if (props == null || !hasOwnProperty.call(props, 'css')) {
    // $FlowFixMe
    return createElement.apply(undefined, args);
  }

  if (process.env.NODE_ENV !== 'production' && typeof props.css === 'string' && // check if there is a css declaration
  props.css.indexOf(':') !== -1) {
    throw new Error("Strings are not allowed as css prop values, please wrap it in a css template literal from '@emotion/css' like this: css`" + props.css + "`");
  }

  var argsLength = args.length;
  var createElementArgArray = new Array(argsLength);
  createElementArgArray[0] = Emotion;
  var newProps = {};

  for (var key in props) {
    if (hasOwnProperty.call(props, key)) {
      newProps[key] = props[key];
    }
  }

  newProps[typePropName] = type;

  if (process.env.NODE_ENV !== 'production') {
    var error = new Error();

    if (error.stack) {
      // chrome
      var match = error.stack.match(/at (?:Object\.|)jsx.*\n\s+at ([A-Z][A-Za-z$]+) /);

      if (!match) {
        // safari and firefox
        match = error.stack.match(/^.*\n([A-Z][A-Za-z$]+)@/);
      }

      if (match) {
        newProps[labelPropName] = sanitizeIdentifier(match[1]);
      }
    }
  }

  createElementArgArray[1] = newProps;

  for (var i = 2; i < argsLength; i++) {
    createElementArgArray[i] = args[i];
  } // $FlowFixMe


  return createElement.apply(null, createElementArgArray);
};

var keyframes = function keyframes() {
  var insertable = css.apply(void 0, arguments);
  var name = "animation-" + insertable.name; // $FlowFixMe

  return {
    name: name,
    styles: "@keyframes " + name + "{" + insertable.styles + "}",
    anim: 1,
    toString: function toString() {
      return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
    }
  };
};

var classnames = function classnames(args) {
  var len = args.length;
  var i = 0;
  var cls = '';

  for (; i < len; i++) {
    var arg = args[i];
    if (arg == null) continue;
    var toAdd = void 0;

    switch (typeof arg) {
      case 'boolean':
        break;

      case 'object':
        {
          if (Array.isArray(arg)) {
            toAdd = classnames(arg);
          } else {
            toAdd = '';

            for (var k in arg) {
              if (arg[k] && k) {
                toAdd && (toAdd += ' ');
                toAdd += k;
              }
            }
          }

          break;
        }

      default:
        {
          toAdd = arg;
        }
    }

    if (toAdd) {
      cls && (cls += ' ');
      cls += toAdd;
    }
  }

  return cls;
};

function merge(registered, css, className) {
  var registeredStyles = [];
  var rawClassName = getRegisteredStyles(registered, registeredStyles, className);

  if (registeredStyles.length < 2) {
    return className;
  }

  return rawClassName + css(registeredStyles);
}

var ClassNames = withEmotionCache(function (props, context) {
  return createElement(ThemeContext.Consumer, null, function (theme) {
    var rules = '';
    var serializedHashes = '';
    var hasRendered = false;

    var css = function css() {
      if (hasRendered && process.env.NODE_ENV !== 'production') {
        throw new Error('css can only be used during render');
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var serialized = serializeStyles(args, context.registered);

      if (isBrowser$2) {
        insertStyles(context, serialized, false);
      } else {
        var res = insertStyles(context, serialized, false);

        if (res !== undefined) {
          rules += res;
        }
      }

      if (!isBrowser$2) {
        serializedHashes += " " + serialized.name;
      }

      return context.key + "-" + serialized.name;
    };

    var cx = function cx() {
      if (hasRendered && process.env.NODE_ENV !== 'production') {
        throw new Error('cx can only be used during render');
      }

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return merge(context.registered, css, classnames(args));
    };

    var content = {
      css: css,
      cx: cx,
      theme: theme
    };
    var ele = props.children(content);
    hasRendered = true;

    if (!isBrowser$2 && rules.length !== 0) {
      var _ref;

      return createElement(Fragment, null, createElement("style", (_ref = {}, _ref["data-emotion-" + context.key] = serializedHashes.substring(1), _ref.dangerouslySetInnerHTML = {
        __html: rules
      }, _ref.nonce = context.sheet.nonce, _ref)), ele);
    }

    return ele;
  });
});

function _templateObject5() {
  var data = _taggedTemplateLiteral(["\n        .uploader-zone-fog-caption {\n            margin-top: 0;\n            bottom: 0;\n        }\n        .uploader-zone-fog-img {\n            width: 2.6rem;\n            top: 0.3rem;\n        }\n        .uploader-zone-fog-controls {\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            flex-flow: row wrap;\n            position: relative;\n            bottom: 0.3rem;\n            \n            > * {\n                margin: 0 0.3rem;\n            }\n        }\n        .uploader-zone-fog-or {\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            flex-flow: row;\n            font-size: 80%;\n            width: 100%;\n        }\n        .uploader-zone-fog-or-wing {\n            flex-grow: 1;\n            height: 0;\n            border-style: solid;\n            border-width: .06rem 0 0 0;\n            border-color: white;\n        }\n        .uploader-zone-fog-or-body {\n            padding: 0.5rem 0.7rem;\n            user-select: none;\n        }\n        .uploader-zone-fog-controls-control {\n            height: 1.6rem;\n            width: 1.6rem;\n            fill: white;\n        }\n    "]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = _taggedTemplateLiteral(["\n        .uploader-zone {\n            border-top-left-radius: 0.25rem !important;\n            border-top-right-radius: 0.25rem !important;\n            border-bottom-left-radius: 0 !important;\n            border-bottom-right-radius: 0 !important;\n        }\n    "]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n        .uploader-zone-fog-img {\n            animation: ", " 2s linear infinite;\n        }\n    "]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n        position: relative;\n        \n        img {\n            max-height: 100%;\n            max-width: 100%;\n            height: auto;\n            width: auto;\n        }\n        \n        .uploader-url-addon {\n            display: flex;\n            align-items: center;\n            padding: .375rem .75rem;\n            margin-bottom: 0;\n            font-weight: 400;\n            line-height: 1.5;\n            color: #495057;\n            text-align: center;\n            white-space: nowrap;\n            background-color: #e9ecef;\n            border: 1px solid #ced4da;\n            border-left-width: 0;\n            border-top-right-radius: 0;\n            border-top-left-radius: 0;\n            border-bottom-left-radius: 0;\n            border-bottom-right-radius: .25rem;\n            \n            svg {\n                margin-right: 0.6rem;\n                fill: #495057;\n                height: 1.4rem;\n            }\n        }\n        \n        .uploader-url-input {\n            display: block;\n            height: calc(1.5em + .75rem + 2px);\n            padding: .375rem .75rem;\n            font-weight: 400;\n            font-size: 1rem;\n            line-height: 1.5;\n            color: #495057;\n            background-color: #fff;\n            background-clip: padding-box;\n            border: 1px solid #ced4da;\n            border-radius: .25rem;\n            border-top-left-radius: 0;\n            border-top-right-radius: 0;\n            border-bottom-right-radius: 0;\n            position: relative;\n            flex-grow: 1;\n            margin-bottom: 0;\n            \n            &:focus {\n                outline: none;\n            }\n        }\n        \n        .uploader-url {\n            width: 100%;\n            display: flex;\n            justify-content: center;\n            align-items: stretch;\n            flex-flow: row;\n            cursor: pointer;\n        }\n        \n        .uploader-zone {\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            flex-flow: row wrap;\n            width: 100%;\n            height: 14rem;\n            overflow: hidden;\n            position: relative;\n            border-radius: 500rem;\n            color: white;\n        }\n    \n        .uploader-zone-fog {\n            display: flex;\n            justify-content: space-evenly;\n            align-items: center;\n            flex-flow: column;\n            background: rgba(0, 0, 0, 0.2);\n            position: absolute;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            cursor: pointer;\n            \n            &:hover {\n                background: rgba(0, 0, 0, 0.5);\n            }\n        }\n        \n        .uploader-zone-fog-caption {\n            width: 80%;\n            text-align: center;\n            position: relative;\n            bottom: 1rem;\n            margin-top: 1rem;\n            text-shadow: 0 0 0.5rem black;\n        }\n        \n        .uploader-zone-fog-img {\n            width: 5rem;\n            fill: white;\n            position: relative;\n            top: 1rem;\n        }\n        \n        .uploader-input {\n            position: fixed;\n            top: -9999px;\n            left: -9999px;\n        }\n    "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n    from {\n        transform: scale(0.7);\n    }\n    50% {\n        transform: scale(1);\n    }\n    to {\n        transform: scale(0.7);\n    }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}
var pulse = keyframes(_templateObject());
var styles = {
  uploader: css(_templateObject2()),
  'uploader/fetching': css(_templateObject3(), pulse),
  'uploader/withUrl': css(_templateObject4()),
  'uploader/withControls': css(_templateObject5())
};

var CloudComputing = function CloudComputing(props) {
  return React.createElement("svg", _extends({
    viewBox: "0 0 512.001 512.001"
  }, props), React.createElement("path", {
    d: "M405.967 187.467c-1.069-78.061-64.902-141.239-143.213-141.239-34.835 0-68.396 12.672-94.498 35.682-23.296 20.535-39.232 47.977-45.543 78.106-.461-.005-.918-.009-1.374-.009C54.434 160.008 0 214.441 0 281.347s54.434 121.339 121.34 121.339h44.534c6.029 0 10.919-4.888 10.919-10.919 0-6.031-4.89-10.919-10.919-10.919H121.34c-54.866 0-99.502-44.636-99.502-99.501s44.636-99.501 99.502-99.501c2.923 0 6.013.157 9.448.48 5.822.54 11.049-3.596 11.842-9.396 3.932-28.82 18.161-55.327 40.067-74.638 22.111-19.492 50.542-30.226 80.056-30.226 66.935 0 121.389 54.455 121.389 121.389 0 2.41-.449 8.642-.449 8.642a10.92 10.92 0 0 0 11.984 11.634 87.102 87.102 0 0 1 8.708-.44c47.297 0 85.778 38.48 85.778 85.778 0 47.297-38.48 85.777-85.778 85.777h-48.902c-6.029 0-10.919 4.888-10.919 10.919s4.89 10.919 10.919 10.919h48.902c59.339 0 107.616-48.275 107.616-107.615-.001-58.808-47.421-106.752-106.034-107.602z"
  }), React.createElement("path", {
    d: "M262.755 97.548c-45.658 0-84.742 34.121-90.914 79.367-.815 5.975 3.371 11.462 9.343 12.295 6.368.888 11.548-3.869 12.295-9.343 4.702-34.479 34.484-60.48 69.276-60.48 6.031 0 10.919-4.888 10.919-10.919 0-6.032-4.889-10.92-10.919-10.92zm50.524 312.735c-4.017-4.496-10.92-4.887-15.418-.868l-26.265 23.463V298.547c0-6.031-4.89-10.919-10.919-10.919-6.031 0-10.919 4.888-10.919 10.919v134.33l-26.264-23.463c-4.496-4.018-11.401-3.627-15.417.868-4.018 4.498-3.63 11.399.868 15.418l39.717 35.483a17.983 17.983 0 0 0 12.014 4.59 17.99 17.99 0 0 0 12.013-4.589l39.719-35.483c4.499-4.017 4.888-10.92.871-15.418z"
  }));
};

var Crop = function Crop(props) {
  return React.createElement("svg", _extends({
    viewBox: "0 0 32 32"
  }, props), React.createElement("path", {
    d: "M29.5 8C30.879 8 32 6.879 32 5.5v-3C32 1.121 30.879 0 29.5 0h-3A2.502 2.502 0 0 0 24 2.5V3H8v-.5C8 1.121 6.879 0 5.5 0h-3A2.503 2.503 0 0 0 0 2.5v3C0 6.879 1.122 8 2.5 8H3v16h-.5A2.503 2.503 0 0 0 0 26.5v3C0 30.879 1.122 32 2.5 32h3C6.879 32 8 30.879 8 29.5V29h16v.5c0 1.379 1.121 2.5 2.5 2.5h3c1.379 0 2.5-1.121 2.5-2.5v-3c0-1.379-1.121-2.5-2.5-2.5H29V8h.5zm-27-2a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3c.275 0 .5.225.5.5v3c0 .275-.225.5-.5.5h-3zM6 29.5c0 .275-.225.5-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3c.275 0 .5.225.5.5v3zm18-3v.5H8v-.5C8 25.121 6.879 24 5.5 24H5V8h.5C6.879 8 8 6.879 8 5.5V5h16v.5C24 6.879 25.121 8 26.5 8h.5v16h-.5a2.502 2.502 0 0 0-2.5 2.5zm5.5-.5c.275 0 .5.225.5.5v3c0 .275-.225.5-.5.5h-3a.501.501 0 0 1-.5-.5v-3c0-.275.225-.5.5-.5h3zm-3-20a.501.501 0 0 1-.5-.5v-3c0-.275.225-.5.5-.5h3c.275 0 .5.225.5.5v3c0 .275-.225.5-.5.5h-3z"
  }));
};

var Garbage = function Garbage(props) {
  return React.createElement("svg", _extends({
    viewBox: "0 0 486.4 486.4"
  }, props), React.createElement("path", {
    d: "M446 70H344.8V53.5c0-29.5-24-53.5-53.5-53.5h-96.2c-29.5 0-53.5 24-53.5 53.5V70H40.4c-7.5 0-13.5 6-13.5 13.5S32.9 97 40.4 97h24.4v317.2c0 39.8 32.4 72.2 72.2 72.2h212.4c39.8 0 72.2-32.4 72.2-72.2V97H446c7.5 0 13.5-6 13.5-13.5S453.5 70 446 70zM168.6 53.5c0-14.6 11.9-26.5 26.5-26.5h96.2c14.6 0 26.5 11.9 26.5 26.5V70H168.6V53.5zm226 360.7c0 24.9-20.3 45.2-45.2 45.2H137c-24.9 0-45.2-20.3-45.2-45.2V97h302.9v317.2h-.1z"
  }), React.createElement("path", {
    d: "M243.2 411c7.5 0 13.5-6 13.5-13.5V158.9c0-7.5-6-13.5-13.5-13.5s-13.5 6-13.5 13.5v238.5c0 7.5 6 13.6 13.5 13.6zm-88.1-14.9c7.5 0 13.5-6 13.5-13.5V173.7c0-7.5-6-13.5-13.5-13.5s-13.5 6-13.5 13.5v208.9c0 7.5 6.1 13.5 13.5 13.5zm176.2 0c7.5 0 13.5-6 13.5-13.5V173.7c0-7.5-6-13.5-13.5-13.5s-13.5 6-13.5 13.5v208.9c0 7.5 6 13.5 13.5 13.5z"
  }));
};

var InternetGlobe = function InternetGlobe(props) {
  return React.createElement("svg", _extends({
    height: 596,
    viewBox: "0 0 447.632 447"
  }, props), React.createElement("path", {
    d: "M231.816 447.05c34.23-4.863 64.239-40.59 83.121-93.35a406.317 406.317 0 0 0-83.12-9.786zm0 0M286.504 438.66c2.023-.586 4.039-1.176 6.039-1.824 1.687-.543 3.352-1.129 5.016-1.711a203.39 203.39 0 0 0 5.882-2.121c1.664-.633 3.313-1.305 4.965-1.977 1.906-.8 3.809-1.597 5.692-2.398a240.401 240.401 0 0 0 10.422-4.922c1.601-.816 3.199-1.648 4.8-2.504 1.793-.96 3.575-1.941 5.344-2.95a203.403 203.403 0 0 0 4.703-2.753c1.735-1.066 3.461-2.133 5.176-3.2a191.535 191.535 0 0 0 4.578-2.991 221.095 221.095 0 0 0 5.008-3.504 417.693 417.693 0 0 0 4.422-3.2 365.942 365.942 0 0 0 4.847-3.793c1.426-1.136 2.848-2.265 4.25-3.433 1.598-1.328 3.13-2.703 4.68-4.078 1.36-1.207 2.727-2.403 4.055-3.64 1.527-1.427 3.015-2.903 4.504-4.368 1.289-1.273 2.593-2.527 3.855-3.832.235-.242.457-.504.7-.754a268.883 268.883 0 0 0-54.817-21.094 198.517 198.517 0 0 1-51.129 83.024c.649-.168 1.297-.305 1.945-.473 1.711-.48 3.391-1.008 5.063-1.504zm0 0M447.633 231.684H351.71a414.882 414.882 0 0 1-16.152 110.68 278.228 278.228 0 0 1 60.714 24.16 223.51 223.51 0 0 0 51.36-134.84zm0 0M231.816 215.684h103.895a400.208 400.208 0 0 0-15.75-106.743 421.384 421.384 0 0 1-88.145 10.512zm0 0M231.816.316v103.137a406.589 406.589 0 0 0 83.121-9.785C296.055 40.906 266.048 5.18 231.817.316zm0 0M231.816 327.914a421.648 421.648 0 0 1 88.145 10.516 400.236 400.236 0 0 0 15.75-106.746H231.816zm0 0M396.273 80.844a278.228 278.228 0 0 1-60.714 24.16 414.882 414.882 0 0 1 16.152 110.68h95.922a223.577 223.577 0 0 0-51.36-134.84zm0 0M385.465 68.707c-.235-.238-.457-.496-.688-.742-1.265-1.305-2.578-2.563-3.867-3.832-1.484-1.465-2.965-2.945-4.496-4.367-1.324-1.235-2.695-2.403-4.055-3.633-1.55-1.375-3.101-2.762-4.695-4.09-1.383-1.168-2.8-2.285-4.207-3.406a171.24 171.24 0 0 0-4.89-3.825 220.477 220.477 0 0 0-4.383-3.199 192.844 192.844 0 0 0-5.055-3.547 200.251 200.251 0 0 0-4.535-2.957 190.441 190.441 0 0 0-5.219-3.257 223.26 223.26 0 0 0-4.664-2.727 220.848 220.848 0 0 0-5.39-2.984c-1.602-.801-3.2-1.672-4.801-2.473-1.84-.93-3.696-1.824-5.598-2.703a174.071 174.071 0 0 0-4.875-2.227c-1.895-.84-3.809-1.597-5.719-2.398a225.094 225.094 0 0 0-4.953-1.969 191.214 191.214 0 0 0-5.879-2.117 210.272 210.272 0 0 0-5.016-1.715c-2-.648-4-1.238-6.054-1.832-1.664-.488-3.336-.984-5.02-1.43-.644-.175-1.3-.312-1.949-.48a198.532 198.532 0 0 1 51.129 83.023 268.485 268.485 0 0 0 54.879-21.113zm0 0M0 215.684h95.922a415.035 415.035 0 0 1 16.148-110.68 277.885 277.885 0 0 1-60.71-24.16A223.519 223.519 0 0 0 0 215.684zm0 0M215.816 447.05V343.915a406.589 406.589 0 0 0-83.12 9.785c18.878 52.762 48.89 88.488 83.12 93.352zm0 0M215.816 231.684H111.922a400.079 400.079 0 0 0 15.75 106.746 421.097 421.097 0 0 1 88.144-10.516zm0 0M215.816.316c-34.23 4.864-64.242 40.59-83.12 93.352a406.045 406.045 0 0 0 83.12 9.785zm0 0M215.816 119.453a421.384 421.384 0 0 1-88.144-10.512 400.05 400.05 0 0 0-15.75 106.743h103.894zm0 0M168.113 6.79c-.648.167-1.297.304-1.945.472-1.695.453-3.367.957-5.055 1.445-2.008.586-4 1.176-6.015 1.816-1.7.551-3.371 1.137-5.043 1.72-1.957.69-3.918 1.378-5.856 2.112-1.672.641-3.32 1.305-4.976 1.985-1.903.8-3.809 1.601-5.688 2.398-1.648.723-3.277 1.48-4.91 2.242a223.908 223.908 0 0 0-5.512 2.68 228.526 228.526 0 0 0-10.137 5.457 149.244 149.244 0 0 0-4.718 2.75c-1.738 1.047-3.457 2.13-5.168 3.2-1.54.984-3.067 1.976-4.578 3a221.095 221.095 0 0 0-5.008 3.503 403.614 403.614 0 0 0-4.426 3.203c-1.637 1.23-3.2 2.512-4.848 3.79-1.421 1.136-2.855 2.265-4.246 3.44-1.601 1.321-3.12 2.688-4.664 4.056-1.367 1.218-2.746 2.402-4.082 3.664-1.52 1.418-3 2.89-4.484 4.351-1.29 1.274-2.602 2.531-3.867 3.84-.23.242-.453.508-.696.754a268.581 268.581 0 0 0 54.817 21.098 198.45 198.45 0 0 1 51.105-82.977zm0 0M66.719 383.234c1.488 1.465 2.969 2.946 4.496 4.371 1.328 1.23 2.695 2.399 4.058 3.63 1.551 1.378 3.102 2.761 4.696 4.09 1.383 1.16 2.793 2.28 4.207 3.405 1.601 1.297 3.199 2.586 4.894 3.833 1.442 1.082 2.907 2.128 4.371 3.203 1.672 1.199 3.36 2.398 5.063 3.55a214.813 214.813 0 0 0 4.535 2.961c1.73 1.11 3.457 2.2 5.219 3.254 1.543.93 3.101 1.84 4.664 2.73a208.275 208.275 0 0 0 5.39 2.981c1.598.801 3.2 1.672 4.801 2.473 1.84.93 3.696 1.824 5.598 2.707 1.601.754 3.226 1.496 4.875 2.223 1.894.84 3.805 1.597 5.719 2.398 1.648.672 3.289 1.336 4.953 1.969 1.941.746 3.91 1.441 5.879 2.12 1.664.583 3.328 1.169 5.015 1.712 2 .648 4 1.242 6.055 1.832 1.664.488 3.336.984 5.016 1.433.648.176 1.304.313 1.953.48a198.57 198.57 0 0 1-51.13-83.027 268.607 268.607 0 0 0-54.816 21.106c.235.238.458.496.692.742 1.2 1.297 2.492 2.555 3.797 3.824zm0 0M51.36 366.523a278.275 278.275 0 0 1 60.71-24.16 415.035 415.035 0 0 1-16.148-110.68H0a223.552 223.552 0 0 0 51.36 134.84zm0 0"
  }));
};

var Image = function Image(props) {
  return React.createElement("svg", _extends({
    viewBox: "0 0 512 512"
  }, props), React.createElement("path", {
    d: "M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM112 120c-30.928 0-56 25.072-56 56s25.072 56 56 56 56-25.072 56-56-25.072-56-56-56zM64 384h384V272l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L208 320l-55.515-55.515c-4.686-4.686-12.284-4.686-16.971 0L64 336v48z"
  }));
};

var Video = function Video(props) {
  return React.createElement("svg", _extends({
    viewBox: "0 0 512 512"
  }, props), React.createElement("path", {
    d: "M488 64h-8v20c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12V64H96v20c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12V64h-8C10.7 64 0 74.7 0 88v336c0 13.3 10.7 24 24 24h8v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h320v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h8c13.3 0 24-10.7 24-24V88c0-13.3-10.7-24-24-24zM96 372c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm272 208c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm0-168c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm112 152c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40z"
  }));
};

var Constants = {
  video: {
    // see https://en.wikipedia.org/wiki/Video_file_format
    mimeTypes: ['video/x-flv', 'video/mp4', 'application/octet-stream', 'application/x-mpegURL', 'video/MP2T', 'video/3gpp', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'],
    extensions: ['3g2', '3gp', 'amv', 'asf', 'avi', 'drc', 'f4a', 'f4b', 'f4p', 'f4v', 'flv', 'gif', 'gifv', 'm2v', 'm4p', 'm4v', 'mkv', 'mov', 'mng', 'mp2', 'mp4', 'mpe', 'mpeg', 'mpg', 'mpv', 'MTS', 'M2TS', 'mxf', 'nsv', 'ogg', 'qt', 'rm', 'rmvb', 'roq', 'svi', 'vob', 'webm', 'wmv', 'yuv']
  },
  image: {
    // see https://github.com/arthurvr/image-extensions/blob/master/image-extensions.json
    mimeTypes: ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/vnd.microsoft.icon', 'image/vnd.djvu', 'image/svg+xml'],
    extensions: ['3dv', 'PI1', 'PI2', 'PI3', 'ai', 'amf', 'art', 'art', 'ase', 'awg', 'blp', 'bmp', 'bw', 'bw', 'cd5', 'cdr', 'cgm', 'cit', 'cmx', 'cpt', 'cr2', 'cur', 'cut', 'dds', 'dib', 'djvu', 'dxf', 'e2d', 'ecw', 'egt', 'egt', 'emf', 'eps', 'exif', 'fs', 'gbr', 'gif', 'gpl', 'grf', 'hdp', 'icns', 'ico', 'iff', 'iff', 'int', 'int', 'inta', 'jfif', 'jng', 'jp2', 'jpeg', 'jpg', 'jps', 'jxr', 'lbm', 'lbm', 'liff', 'max', 'miff', 'mng', 'msp', 'nitf', 'nrrd', 'odg', 'ota', 'pam', 'pbm', 'pc1', 'pc2', 'pc3', 'pcf', 'pct', 'pcx', 'pcx', 'pdd', 'pdn', 'pgf', 'pgm', 'pict', 'png', 'pnm', 'pns', 'ppm', 'psb', 'psd', 'psp', 'px', 'pxm', 'pxr', 'qfx', 'ras', 'raw', 'rgb', 'rgb', 'rgba', 'rle', 'sct', 'sgi', 'sgi', 'sid', 'stl', 'sun', 'svg', 'sxd', 'tga', 'tga', 'tif', 'tiff', 'v2d', 'vnd', 'vrml', 'vtf', 'wdp', 'webp', 'wmf', 'x3d', 'xar', 'xbm', 'xcf', 'xpm']
  },
  compressedFile: {
    // see https://en.wikipedia.org/wiki/List_of_archive_formats
    mimeTypes: [// compression only
    'application/x-bzip2', 'application/gzip', 'application/x-lzip', 'application/x-lzma', 'application/x-lzop', 'application/x-snappy-framed', 'application/x-xz', 'application/x-compress', // archiving and compression
    'application/x-7z-compressed', 'application/x-ace-compressed', 'application/x-astrotite-afa', 'application/x-alz-compressed', 'application/vnd.android.package-archive', 'application/x-arj', 'application/x-b1', 'application/vnd.ms-cab-compressed', 'application/x-cfs-compressed', 'application/x-dar', 'application/x-dgc-compressed', 'application/x-apple-diskimage', 'application/x-gca-compressed', 'application/x-lzh', 'application/x-lzx', 'application/x-rar-compressed', 'application/x-stuffit', 'application/x-stuffitx', 'application/x-gtar', 'application/zip', 'application/x-zoo'],
    extensions: [// compression only
    'bz2', 'gz', 'F', 'lz', 'lzma', 'lzo', 'rz', 'sfark', 'sz', 'xz', 'z', 'Z', '?Q?', '?XF', '?Z?', '??_', // archiving and compression
    '7z', 'ace', 'afa', 'alz', 'apk', 'arc', 'arj', 'b1', 'b6z', 'ba', 'bh', 'cab', 'car', 'cfs', 'cpt', 'dar', 'dd', 'dgc', 'dmg', 'ear', 'gca', 'ha', 'hki', 'ice', 'jar', 'kgb', 'lha', 'lzh', 'lzx', 'pak', 'paq6', 'paq7', 'paq8', 'partimg', 'pea', 'pim', 'pit', 'qda', 'rar', 'rk', 's7z', 'sda', 'sea', 'sen', 'sfx', 'shk', 'sit', 'sitx', 'sqx', 'tar.bz2', 'tar.gz', 'tar.lzma', 'tar.xz', 'tar.Z', 'tbz2', 'tgz', 'tlz', 'txz', 'ue2', 'uc', 'uc0', 'uc2', 'uca', 'ucn', 'uha', 'ur2', 'war', 'wim', 'xar', 'xp3', 'yz1', 'zip', 'zipx', 'zoo', 'zpaq', 'zz']
  }
};

function _templateObject$1() {
  var data = _taggedTemplateLiteral(["\n                    ", ";\n                    ", ";\n                    ", ";\n                    ", ";\n                "]);

  _templateObject$1 = function _templateObject() {
    return data;
  };

  return data;
}
var validator = {
  isURL: isURL
};
var _ = {
  camelCase: camelCase,
  concat: concat,
  debounce: debounce,
  difference: difference,
  get: get,
  isString: isString,
  last: last,
  map: map,
  round: round,
  split: split,
  upperCase: upperCase,
  upperFirst: upperFirst
};

var Uploader =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Uploader, _React$Component);

  function Uploader(props) {
    var _this;

    _classCallCheck(this, Uploader);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Uploader).call(this, props));
    _this.state = {
      beingDropTarget: false,
      height: null,
      file: null,
      loaded: false,
      mounted: false,
      url: '',
      width: null,
      _forceUpdateCounter: 0
    };
    _this.change = _this.change.bind(_assertThisInitialized(_this));
    _this.handleChange = _this.handleChange.bind(_assertThisInitialized(_this));
    _this.handleClick = _this.handleClick.bind(_assertThisInitialized(_this));
    _this.handleCropClick = _this.handleCropClick.bind(_assertThisInitialized(_this));
    _this.handleDragLeave = _this.handleDragLeave.bind(_assertThisInitialized(_this));
    _this.handleDragEnter = _this.handleDragEnter.bind(_assertThisInitialized(_this));
    _this.handleDrop = _this.handleDrop.bind(_assertThisInitialized(_this));
    _this.handleInjectURLClick = _this.handleInjectURLClick.bind(_assertThisInitialized(_this));
    _this.handleLoad = _this.handleLoad.bind(_assertThisInitialized(_this));
    _this.handleRemoveClick = _this.handleRemoveClick.bind(_assertThisInitialized(_this));
    _this.handleURLChange = _this.handleURLChange.bind(_assertThisInitialized(_this));
    _this.get = _this.get.bind(_assertThisInitialized(_this));
    _this.injectURL = _this.injectURL.bind(_assertThisInitialized(_this));
    _this.change = _this.change.bind(_assertThisInitialized(_this));
    _this._forceUpdate = _this._forceUpdate.bind(_assertThisInitialized(_this));
    _this.forceUpdateOnResize = _.debounce(_this._forceUpdate, 500);
    return _this;
  }

  _createClass(Uploader, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.setState({
        mounted: true
      });
      this.initializeDrag();
      window.addEventListener('resize', this.forceUpdateOnResize);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener('resize', this.forceUpdateOnResize);
    } // Hack: Force re-render by incrementing a counter to re-calculate the preview resizing infos after a window resize

  }, {
    key: "_forceUpdate",
    value: function _forceUpdate() {
      this.setState({
        _forceUpdateCounter: this.state._forceUpdateCounter++
      });
    }
  }, {
    key: "change",
    value: function change(file) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (data) {
        return null;
      };
      var maxSize = this.props.maxSize;
      if (this.guessFileType(file) !== this.props.fileType) this.props.onInvalidFileExtensionError();else if (maxSize && file.size >= maxSize) this.props.onFileTooLargeError();else this.props.onChange(file);
      callback(file);
      this.input.value = null; // clear input (same image set in twice would otherwise be ignored, for example)
    }
  }, {
    key: "handleChange",
    value: function handleChange(ev) {
      var file = _.get(ev, 'target.files.0');

      if (file) this.change(file);
    }
  }, {
    key: "handleClick",
    value: function handleClick(ev) {
      this.input.click();
    }
  }, {
    key: "handleCropClick",
    value: function handleCropClick(ev) {
      ev.stopPropagation();
      this.props.onCropClick();
    }
  }, {
    key: "handleDragLeave",
    value: function handleDragLeave() {
      if (--this.dndCounter === 0) this.setState({
        beingDropTarget: false
      });
    }
  }, {
    key: "handleDragEnter",
    value: function handleDragEnter(ev) {
      ev.preventDefault(); // needed for IE

      if (this.dndCounter === undefined) this.dndCounter = 0;
      this.dndCounter++;
      this.setState({
        beingDropTarget: true
      });
    }
  }, {
    key: "handleDrop",
    value: function handleDrop(ev) {
      ev.preventDefault();
      this.dndCounter = 0;
      this.setState({
        beingDropTarget: false
      });

      var file = _.get(ev, 'dataTransfer.files.0');

      if (file) this.change(file);
    }
  }, {
    key: "handleInjectURLClick",
    value: function handleInjectURLClick() {
      this.injectURL(this.state.url, true);
    }
  }, {
    key: "handleLoad",
    value: function handleLoad() {
      if (typeof this.firstLoadDone === 'undefined') {
        this.firstLoadDone = true;
        this.props.onFirstLoad();
      }

      this.setState({
        loaded: true
      }, this.props.onLoad);
    }
  }, {
    key: "handleRemoveClick",
    value: function handleRemoveClick(ev) {
      ev.stopPropagation();
      this.props.onRemoveClick();
    }
  }, {
    key: "handleURLChange",
    value: function handleURLChange(ev) {
      var value = ev.target.value;
      this.setState({
        url: value
      });
    }
  }, {
    key: "get",
    value: function get(url) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open('GET', url, true);

        xhr.onload = function () {
          if (xhr.status === 200) resolve(xhr.response);else reject(Error(xhr.statusText));
        };

        xhr.onerror = function () {
          return reject(Error('Network Error'));
        };

        xhr.send();
      });
    }
  }, {
    key: "injectURL",
    value: function injectURL(url) {
      var _this2 = this;

      var validate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (data) {
        return null;
      };

      if (validate && !validator.isURL(url)) {
        this.props.onInvalidURLError();
        return;
      }

      this.get(url).then(function (response) {
        var name = _.last(_.split(url, '/')),
            file = new File([response], name, {
          type: response.type
        });

        _this2.change(file, callback);
      })["catch"](function (error) {
        _this2.props.onURLInjectionError(error);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var media = null,
          icon = null,
          withControls = this.props.src && (this.props.removable || this.props.croppable);

      if (this.props.src) {
        var fileType = this.props.fileType || this.guessFileType(this.props.src);

        switch (fileType) {
          case 'image':
            if (this.state.loaded && this.state.mounted && this.props.imageCrop && this.zone) {
              var style = {};

              if (this.cropImg) {
                var zoneWidth = this.zone.offsetWidth,
                    zoneHeight = this.zone.offsetHeight,
                    displayWidth = this.cropImg.offsetWidth,
                    displayHeight = this.cropImg.offsetHeight,
                    realWidth = this.cropImg.naturalWidth,
                    realHeight = this.cropImg.naturalHeight,
                    displayCropX = displayWidth * this.props.imageCrop.x / realWidth,
                    displayCropY = displayHeight * this.props.imageCrop.y / realHeight,
                    displayCropWidth = displayWidth * this.props.imageCrop.width / realWidth,
                    displayCropHeight = displayHeight * this.props.imageCrop.height / realHeight,
                    displayCropRatio = displayCropWidth / displayCropHeight,
                    scale = null; // image fit to zone

                if (this.props.backgroundSize === 'contain') {
                  if (zoneHeight * displayCropRatio > zoneWidth) scale = zoneWidth / displayCropWidth;else scale = zoneHeight / displayCropHeight;
                } else {
                  if (zoneHeight * displayCropRatio > zoneWidth) scale = zoneHeight / displayCropHeight;else scale = zoneWidth / displayCropWidth;
                }

                style = {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transformOrigin: "".concat(displayCropX + displayCropWidth / 2, "px ").concat(displayCropY + displayCropHeight / 2, "px"),
                  transform: "\n                                    translateX(-".concat(displayCropX + displayCropWidth / 2, "px)\n                                    translateY(-").concat(displayCropY + displayCropHeight / 2, "px)\n                                    scale(").concat(scale, ")\n                                "),
                  clip: "rect(\n                                    ".concat(displayCropY, "px\n                                    ").concat(displayCropX + displayCropWidth, "px\n                                    ").concat(displayCropY + displayCropHeight, "px\n                                    ").concat(displayCropX, "px)\n                                ")
                };
              }

              media = jsx("img", {
                alt: "",
                ref: function ref(obj) {
                  return _this3.cropImg = obj;
                },
                src: this.props.src,
                onLoad: this._forceUpdate,
                style: style
              });
            } else {
              media = jsx("div", {
                style: {
                  backgroundColor: this.props.backgroundColor,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  backgroundSize: this.props.backgroundSize,
                  backgroundImage: "url(".concat(this.props.src, ")"),
                  position: 'relative',
                  width: '100%',
                  height: '100%'
                }
              }, jsx("img", {
                alt: "",
                ref: function ref(obj) {
                  return _this3.img = obj;
                },
                src: this.props.src,
                onLoad: this.handleLoad,
                style: {
                  position: 'fixed',
                  top: '-9999px',
                  left: '-9999px'
                }
              }));
            }

            break;

          case 'video':
            media = jsx("video", {
              autoPlay: true,
              loop: true,
              muted: true,
              src: this.props.src,
              onLoadedData: this.handleLoad,
              style: this.props.backgroundSize === 'cover' ? {
                height: '100%' // considering the majority of videos at landscape format

              } : {
                maxHeight: '100%',
                maxWidth: '100%'
              }
            });
            break;
        }
      }

      switch (this.props.fileType) {
        case 'image':
          icon = jsx(Image, {
            className: "uploader-zone-fog-img"
          });
          break;

        case 'video':
          icon = jsx(Video, {
            className: "uploader-zone-fog-img"
          });
          break;
      }

      return jsx("div", _extends({
        "data-attr": "root"
      }, _.get(this.props.customAttributes, 'root', {}), {
        className: "\n                    uploader\n                    ".concat(_.get(this.props.customAttributes, 'root.className', ''), "\n                "),
        css: css(_templateObject$1(), styles.uploader, this.props.fetching ? styles['uploader/fetching'] : null, this.props.withURLInput ? styles['uploader/withUrl'] : null, withControls ? styles['uploader/withControls'] : null)
      }), jsx("input", {
        "data-attr": "input",
        ref: function ref(obj) {
          return _this3.input = obj;
        },
        type: "file",
        className: "uploader-input",
        onChange: this.handleChange
      }), jsx("div", {
        ref: function ref(obj) {
          return _this3.zone = obj;
        },
        className: "\n                        uploader-zone\n                        ".concat(this.props.withURLInput ? 'uploader-zone/withUrl' : '', "\n                    "),
        onDragEnter: this.handleDragEnter,
        onDragLeave: this.handleDragLeave,
        onDrop: this.handleDrop
      }, media, jsx("div", {
        className: "uploader-zone-fog",
        onClick: this.handleClick
      }, !this.props.compact || !this.props.removable && !this.props.croppable || !this.props.src ? jsx(React.Fragment, null, this.state.beingDropTarget ? jsx(CloudComputing, {
        className: "uploader-zone-fog-img"
      }) : icon, jsx("div", {
        className: "uploader-zone-fog-caption"
      }, this.props.fetching ? this.props.catalogue.loading : "".concat(this.props.catalogue.click).concat(this.props.catalogue.drop ? "/".concat(this.props.catalogue.drop) : '').concat(this.props.withURLInput ? "/".concat(this.props.catalogue.typeURL) : ''))) : null, withControls === true && jsx(React.Fragment, null, !this.props.compact ? jsx("div", {
        className: "uploader-zone-fog-or"
      }, jsx("div", {
        className: "uploader-zone-fog-or-wing"
      }), jsx("div", {
        className: "uploader-zone-fog-or-body"
      }, this.props.catalogue.or), jsx("div", {
        className: "uploader-zone-fog-or-wing"
      })) : null, jsx("div", {
        className: "uploader-zone-fog-controls"
      }, this.props.croppable === true && jsx("span", {
        className: "uploader-zone-fog-controls-control",
        onClick: this.handleCropClick
      }, this.props.cropIcon || jsx(Crop, null)), this.props.removable === true && jsx("span", {
        className: "uploader-zone-fog-controls-control",
        onClick: this.handleRemoveClick
      }, this.props.removeIcon || jsx(Garbage, null)))))), this.props.withURLInput === true && jsx("div", {
        className: "uploader-url"
      }, jsx("input", {
        className: "uploader-url-input",
        name: "url",
        value: this.state.url,
        placeholder: this.props.catalogue.urlInputPlaceholder,
        type: "text",
        onChange: this.handleURLChange,
        onKeyPress: function onKeyPress(ev) {
          if (ev.which === 13) {
            // enter would otherwise submit form
            ev.preventDefault();

            _this3.handleInjectURLClick();
          }
        }
      }), jsx("span", {
        className: "uploader-url-addon",
        onClick: this.handleInjectURLClick
      }, jsx(InternetGlobe, {
        className: "uploader-url-addon-icon"
      }), this.props.catalogue.urlSubmitText)));
    } // + utils

    /**
     * Input may be url string, base64, File.
     */

  }, {
    key: "guessFileType",
    value: function guessFileType(input) {
      return this.fileType(this.base64MimeType(input) || this.extension(input));
    }
    /**
     * From Base64 dataURL to MIME Type
     * Returns null when input is invalid
     */

  }, {
    key: "base64MimeType",
    value: function base64MimeType(encoded) {
      var result = null;
      if (typeof encoded !== 'string') return result;
      var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      if (mime && mime.length) result = mime[1];
      return result;
    }
  }, {
    key: "isBase64",
    value: function isBase64(input) {
      return this.base64MimeType(input) !== null;
    }
    /**
     * From string|File to extension
     * Ex: https://upload.wikimedia.org/wikipedia/commons/d/da/Nelson_Mandela%2C_2000_%285%29_%28cropped%29.jpg => jpg
     */

  }, {
    key: "extension",
    value: function extension(input) {
      input = _.isString(input) ? input : input.name;
      return _.last(_.split(input, '.'));
    }
    /**
     * Input may be a MIME Type or an extension
     * Ex: video/mp4 => video, or application/zip => compressedFile
     */

  }, {
    key: "fileType",
    value: function fileType(input) {
      var isExtension = !input.match(/\//);

      if (isExtension) {
        var extensions = {
          video: Constants.video.extensions,
          image: Constants.image.extensions,
          compressedFile: Constants.compressedFile.extensions
        }; // unless some have explicitly been provided

        if (this.props.extensions) extensions = _defineProperty({}, this.props.fileType, this.props.extensions);

        for (var k in extensions) {
          var v = _.concat(extensions[k], _.map(extensions[k], function (ext) {
            return _.upperCase(ext);
          })); // case insensitive


          if (v.indexOf(input) !== -1) return k;
        }
      } else {
        var mimeTypes = {
          video: Constants.video.mimeTypes,
          image: Constants.image.mimeTypes,
          compressedFile: Constants.compressedFile.mimeTypes
        }; // unless some have explicitly been provided

        if (this.props.mimeTypes) mimeTypes = _defineProperty({}, this.props.fileType, this.props.mimeTypes);

        for (var _k in mimeTypes) {
          var _v = mimeTypes[_k];
          if (_v.indexOf(input) !== -1) return _k;
        }
      }

      return null;
    }
    /**
     * From '100000000' to '100 MB'
     */

  }, {
    key: "humanSize",
    value: function humanSize(size) {
      var round = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var units = ['B', 'KB', 'MB', 'GB', 'TB'];

      for (var power = units.length - 1; power >= 0; power--) {
        var tmpRes = size * 1.0 / Math.pow(1000, power);

        if (tmpRes >= 1) {
          if (round) tmpRes = _.round(tmpRes);
          return "".concat(tmpRes, " ").concat(units[power]);
        }
      }
    }
  }, {
    key: "initializeDrag",
    value: function initializeDrag() {
      // avoid browser drop management
      window.addEventListener('dragover', function (ev) {
        ev = ev || event;
        ev.preventDefault();
      }, false);
      window.addEventListener('drop', function (ev) {
        ev = ev || event;
        ev.preventDefault();
      }, false);
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      return _objectSpread({}, nextProps.src !== _.get(prevState, '_src') ? {
        _src: nextProps.src
      } : null, nextProps.src !== _.get(prevState, '_src') ? {
        loaded: false,
        _forceUpdateCounter: 0
      } : null);
    }
  }]);

  return Uploader;
}(React.Component);
Uploader.propTypes = {
  // optional
  backgroundColor: PropTypes.string,
  backgroundSize: PropTypes.oneOf(['contain', 'cover']),
  catalogue: function catalogue(props, propName, componentName) {
    var givenCatalogue = props[propName],
        givenPropsKeys = Object.keys(props[propName]),
        expectedPropsKeys = Object.keys(Uploader.defaultProps[propName]);
    if (!givenCatalogue || _typeof(givenCatalogue) !== 'object') throw new Error('Catalogue must be an object.');

    var diffKeys = _.difference(expectedPropsKeys, givenPropsKeys);

    if (diffKeys.length) throw new Error('Given catalogue is insufficient. Missing keys: ' + JSON.stringify(diffKeys));
  },
  compact: PropTypes.bool,
  croppable: PropTypes.bool,
  customAttributes: PropTypes.object,
  extensions: PropTypes.array,
  fetching: PropTypes.bool,
  fileType: PropTypes.oneOf(['compressedFile', 'image', 'video']),
  // expected file type
  imageCrop: PropTypes.object,
  maxSize: PropTypes.number,
  mimeTypes: PropTypes.array,
  onChange: PropTypes.func,
  onCropClick: PropTypes.func,
  onFileTooLargeError: PropTypes.func,
  onFirstLoad: PropTypes.func,
  onInvalidFileExtensionError: PropTypes.func,
  onInvalidURLError: PropTypes.func,
  onLoad: PropTypes.func,
  onRemoveClick: PropTypes.func,
  onURLInjectionError: PropTypes.func,
  removable: PropTypes.bool,
  src: PropTypes.string,
  withURLInput: PropTypes.bool
};
Uploader.defaultProps = {
  backgroundColor: 'transparent',
  backgroundSize: 'cover',
  catalogue: {
    click: null,
    drop: null,
    typeURL: null,
    loading: null,
    or: null,
    urlInputPlaceholder: null,
    urlSubmitText: null
  },
  compact: true,
  croppable: false,
  cropIcon: null,
  // if let null, it will be default one
  customAttributes: {},
  extensions: null,
  // if not set and left as it is, we'll use default ones
  fetching: false,
  fileType: 'image',
  imageCrop: null,
  maxSize: 10 * 1000 * 1000,
  mimeTypes: null,
  // if not set and left as it is, we'll use default ones
  onChange: function onChange(file) {
    return null;
  },
  onCropClick: function onCropClick() {
    return null;
  },
  onFileTooLargeError: function onFileTooLargeError() {
    return null;
  },
  onFirstLoad: function onFirstLoad() {
    return null;
  },
  onInvalidFileExtensionError: function onInvalidFileExtensionError() {
    return null;
  },
  onInvalidURLError: function onInvalidURLError() {
    return null;
  },
  onLoad: function onLoad() {
    return null;
  },
  onRemoveClick: function onRemoveClick() {
    return null;
  },
  onURLInjectionError: function onURLInjectionError() {
    return null;
  },
  removable: false,
  removeIcon: null,
  // if let null, it will be default one
  src: null,
  withURLInput: false
};

export default Uploader;
