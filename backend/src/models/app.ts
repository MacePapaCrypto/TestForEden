
import Model, { Type } from '../base/model';
import AppInstallModel from './appInstall';
import UserModel from './user';

/**
 * export model
 */
@Type('app')
export default class AppModel extends Model {
  
  /**
   * find by package
   *
   * @param name 
   * @returns 
   */
  static async findByPackage(name) {
    // find by package
    return (await AppModel.findByRef(`package:${name.toLowerCase()}`, 1))[0];
  }

  /**
   * find by default
   *
   * @param args 
   * @returns 
   */
  static findByDefault(...args) {
    // return find by default
    return AppModel.findByRef(`default`, ...args);
  }

  /**
   * is following account
   *
   * @param from 
   * @param to 
   */
  static isInstalled(from, to) {
    // find by ref
    return AppInstallModel.findById(`${from}:${to}`.toLowerCase());
  }

  /**
   * creates follower account
   *
   * @param from 
   * @param to 
   */
  static async addInstall(account, appId) {
    // lower the case
    appId = appId.toLowerCase();
    account = account.toLowerCase();

    // load accounts
    const actualApp = await AppModel.findById(appId);

    // check to model
    if (!actualApp) return;

    // is following
    const alreadyInstalled = await AppModel.isInstalled(account, appId);

    // if not following
    if (alreadyInstalled) return [alreadyInstalled, (actualApp.get('count.installs') || 0)];

    // count
    const newCount = (actualApp.get('count.installs') || 0) + 1;

    // create follower
    const actualInstall = new AppInstallModel({
      id  : `${account}:${appId}`.toLowerCase(),
      app : actualApp.get('id'),

      account,
      version : actualApp.get('version'),

      refs : [
        `app:${appId}`,
        `install:${[account, appId].sort().join(':')}`,
        `account:${account}`,
      ].map((ref) => ref.toLowerCase())
    });

    // save follower
    await actualInstall.save(null, true);

    // from background
    const bgFollow = Promise.all([
      (async () => {
        // lock
        const fromLock = await AppInstallModel.pubsub.lock(account);
  
        // try/catch
        try {
          // load accounts
          const fromAccount = await UserModel.findById(account) || new UserModel({
            id : account,
          });
          
          // add account
          fromAccount.set('count.installed', (fromAccount.get('count.installed') || 0) + 1);
          await fromAccount.save();
        } catch (e) {}
  
        // unlock
        fromLock();
      })(),
      (async () => {
        // lock
        const toLock = await AppModel.pubsub.lock(appId);

        // load accounts
        const lockedAppModel = await AppModel.findById(appId);
  
        // try/catch
        try {

          // check to
          if (lockedAppModel) {
            lockedAppModel.set('count.installs', (lockedAppModel.get('count.installs') || 0) + 1);
            await lockedAppModel.save();
          }
        } catch (e) {}
  
        // unlock
        toLock();
      })()
    ]);

    // return follower
    return [actualInstall, newCount];
  }

  /**
   * removes follower
   */
  async remove() {
    // super
    const removing = super.remove();

    // to
    const appId = this.__data.appId.toLowerCase();
    const account = this.__data.account.toLowerCase();

    // load accounts
    const actualApp = await AppModel.findById(appId);

    // check to model
    if (!actualApp) return;

    // get count
    let newCount = (actualApp.get('count.installs') || 0) - 1;
    newCount = newCount < 0 ? 0 : newCount;

    // from background
    const bgFollow = Promise.all([
      (async () => {
        // lock
        const fromLock = await AppInstallModel.pubsub.lock(account);
  
        // try/catch
        try {
          // load accounts
          const fromAccount = await UserModel.findById(account) || new UserModel({
            id : account,
          });

          // get count
          let updateCount = (fromAccount.get('count.installed') || 0) - 1;
          updateCount = updateCount < 0 ? 0 : updateCount;
          
          // add account
          fromAccount.set('count.installed', updateCount);
          await fromAccount.save();
        } catch (e) {}
  
        // unlock
        fromLock();
      })(),
      (async () => {
        // lock
        const toLock = await AppModel.pubsub.lock(appId);

        // load accounts
        const lockedAppModel = await AppModel.findById(appId);

        // get count
        let updateCount = (lockedAppModel.get('count.installs') || 0) - 1;
        updateCount = updateCount < 0 ? 0 : updateCount;
  
        // try/catch
        try {
          // check to
          if (lockedAppModel) {
            lockedAppModel.set('count.installs', updateCount);
            await lockedAppModel.save();
          }
        } catch (e) {}
  
        // unlock
        toLock();
      })()
    ]);

    // remove
    return [removing, newCount];
  }
}