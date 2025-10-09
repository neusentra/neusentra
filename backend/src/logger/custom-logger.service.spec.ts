import { CustomLogger } from './custom-logger.service';

describe('CustomLogger', () => {
  let logger: CustomLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();

    // Default environment variables
    process.env.LOGGER_LEVEL = 'debug';
    process.env.PRETTY_PRINT_LOG = 'false';

    logger = new CustomLogger('TestContext');

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => { });

    // Spy on parent ConsoleLogger methods
    jest.spyOn(logger, 'log');
    jest.spyOn(logger, 'error');
    jest.spyOn(logger, 'warn');
    jest.spyOn(logger, 'debug');
    jest.spyOn(logger, 'verbose');
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('init', () => {
    it('sets log levels based on LOGGER_LEVEL env var', () => {
      process.env.LOGGER_LEVEL = 'warn';
      const newLogger = new CustomLogger('Ctx');
      expect(newLogger['prettyPrintLog']).toBe(false);

      expect(newLogger.isLevelEnabled('error')).toBe(true);
      expect(newLogger.isLevelEnabled('warn')).toBe(true);
      expect(newLogger.isLevelEnabled('log')).toBe(false);
      expect(newLogger.isLevelEnabled('debug')).toBe(false);
    });

    it('sets prettyPrintLog based on PRETTY_PRINT_LOG env var', () => {
      process.env.PRETTY_PRINT_LOG = 'true';
      const newLogger = new CustomLogger('Ctx');
      expect(newLogger['prettyPrintLog']).toBe(true);
    });
  });

  describe('log methods', () => {
    it('log calls super.log when prettyPrint is true', () => {
      process.env.PRETTY_PRINT_LOG = 'true';
      const prettyLogger = new CustomLogger('Ctx');
      const superLogSpy = jest.spyOn(prettyLogger, 'log');
      prettyLogger.log('message', 'arg1');
      expect(superLogSpy).toHaveBeenCalledWith('message', 'arg1');
    });

    it('log calls printPlain when prettyPrint is false', () => {
      process.env.PRETTY_PRINT_LOG = 'false';
      const plainLogger = new CustomLogger('Ctx');
      const printPlainSpy = jest.spyOn(plainLogger as any, 'printPlain');
      plainLogger.log('message', 'arg1');
      expect(printPlainSpy).toHaveBeenCalledWith('message', 'log');
    });

    it('does not call log if level not enabled', () => {
      process.env.LOGGER_LEVEL = 'error';
      const newLogger = new CustomLogger('Ctx');
      const printPlainSpy = jest.spyOn(newLogger as any, 'printPlain');
      newLogger.log('message');
      expect(printPlainSpy).not.toHaveBeenCalled();
    });

    it('error calls super.error or printPlain based on prettyPrint', () => {
      process.env.PRETTY_PRINT_LOG = 'true';
      const prettyLogger = new CustomLogger('Ctx');
      const superErrorSpy = jest.spyOn(prettyLogger, 'error');
      prettyLogger.error('err', 'arg');
      expect(superErrorSpy).toHaveBeenCalledWith('err', 'arg');
    });

    it('warn calls super.warn or printPlain based on prettyPrint', () => {
      process.env.PRETTY_PRINT_LOG = 'true';
      const prettyLogger = new CustomLogger('Ctx');
      const superWarnSpy = jest.spyOn(prettyLogger, 'warn');
      prettyLogger.warn('warn', 'arg');
      expect(superWarnSpy).toHaveBeenCalledWith('warn', 'arg');
    });

    it('debug calls super.debug or printPlain based on prettyPrint', () => {
      process.env.PRETTY_PRINT_LOG = 'true';
      const prettyLogger = new CustomLogger('Ctx');
      const superDebugSpy = jest.spyOn(prettyLogger, 'debug');
      prettyLogger.debug('debug', 'arg');
      expect(superDebugSpy).toHaveBeenCalledWith('debug', 'arg');
    });

    it('verbose calls super.verbose or printPlain based on prettyPrint', () => {
      process.env.PRETTY_PRINT_LOG = 'true';
      const prettyLogger = new CustomLogger('Ctx');
      const superVerboseSpy = jest.spyOn(prettyLogger, 'verbose');
      prettyLogger.verbose('verbose', 'arg');
      expect(superVerboseSpy).toHaveBeenCalledWith('verbose', 'arg');
    });
  });

  describe('printPlain', () => {
    it('calls the appropriate console method with formatted message', () => {
      const formatted = `[TestContext] "message"`;
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      (logger as any).printPlain('message', 'log');
      expect(consoleLogMock).toHaveBeenCalledWith(formatted);
      consoleLogMock.mockRestore();
    });
  });

  describe('isPrettyPrint', () => {
    it('returns the prettyPrintLog boolean', () => {
      expect(logger['isPrettyPrint']()).toBe(logger.prettyPrintLog);
    });
  });
});
