import { UtilsService } from './utils.service';
import * as K from 'src/common/constants';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    service = new UtilsService();
  });

  describe('toCamel', () => {
    it('should convert snake_case to camelCase correctly', () => {
      expect(service.toCamel('hello_world')).toBe('helloWorld');
      expect(service.toCamel('some_text_1')).toBe('someText1');
      expect(service.toCamel('abc_1_2_3')).toBe('abc123');
      expect(service.toCamel('no_change')).toBe('noChange');
      expect(service.toCamel('multiple_words_combined')).toBe(
        'multipleWordsCombined',
      );
    });

    it('should return original if no underscore followed by letter/digit', () => {
      expect(service.toCamel('test')).toBe('test');
      expect(service.toCamel('test__')).toBe('test__');
      expect(service.toCamel('test_')).toBe('test_');
    });
  });

  describe('isObject (private)', () => {
    it('should identify objects correctly', () => {
      // Can only test indirectly via convertKeysToCamelCase behavior
      expect(service['isObject']({})).toBe(true);
      expect(service['isObject']({ a: 1 })).toBe(true);
      expect(service['isObject']([])).toBe(false);
      expect(service['isObject'](new Date())).toBe(false);
      expect(service['isObject'](() => {})).toBe(false);
      expect(service['isObject']('string')).toBe(false);
      expect(service['isObject'](123)).toBe(false);
      expect(service['isObject'](null)).toBe(false);
      expect(service['isObject'](undefined)).toBe(false);
    });
  });

  describe('convertKeysToCamelCase', () => {
    it('should convert keys in objects recursively', () => {
      const input = {
        some_key: 'value',
        nested_object: {
          another_key: 42,
          deep_array: [{ deep_key: 'deep value' }],
        },
      };

      const expected = {
        someKey: 'value',
        nestedObject: {
          anotherKey: 42,
          deepArray: [{ deepKey: 'deep value' }],
        },
      };

      expect(service.convertKeysToCamelCase(input)).toEqual(expected);
    });

    it('should convert keys in array of objects recursively', () => {
      const input = [{ first_key: 'a' }, { second_key: 'b' }];

      const expected = [{ firstKey: 'a' }, { secondKey: 'b' }];

      expect(service.convertKeysToCamelCase(input)).toEqual(expected);
    });

    it('should leave primitives unmodified', () => {
      expect(service.convertKeysToCamelCase('string')).toBe('string');
      expect(service.convertKeysToCamelCase(123)).toBe(123);
      expect(service.convertKeysToCamelCase(null)).toBeNull();
      expect(service.convertKeysToCamelCase(undefined)).toBeUndefined();
      expect(service.convertKeysToCamelCase(true)).toBe(true);
    });
  });

  describe('escapeSpecialCharacters', () => {
    it('should escape all special characters defined in K.SPECIAL_CHARACTERS', () => {
      // Prepare a string containing all special characters from K.SPECIAL_CHARACTERS
      const specials = K.SPECIAL_CHARACTERS.source
        .replace('[', '')
        .replace(']', '');
      const input = specials.split('').join('');
      const escaped = service.escapeSpecialCharacters(input);
      // Each special char should be prefixed with backslash
      for (const char of specials.split('')) {
        expect(escaped).toContain(`\\${char}`);
      }
    });

    it('should not escape non-special characters', () => {
      expect(service.escapeSpecialCharacters('abc123')).toBe('abc123');
    });
  });
});
