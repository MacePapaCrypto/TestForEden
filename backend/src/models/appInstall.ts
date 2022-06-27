
import Model, { Type } from '../base/model';
import AppModel from './app';
import UserModel from './user';

/**
 * export model
 */
@Type('appInstall')
export default class AppInstallModel extends Model {
  
  /**
   * get app
   *
   * @returns 
   */
  getApp() {
    // get app
    return AppModel.findById(this.get('app'));
  }

  /**
   * find by app version
   *
   * @param appId 
   * @param version 
   * @returns 
   */
  static findByAccount(accountId, ...args) {
    // find by ref
    return AppInstallModel.findByRef(`account:${accountId}`, ...args);
  }

  /**
   * to json
   */
  async toJSON(cache = {}) {
    // get app
    const app = await this.getApp();

    // sanitise
    const sanitised = await app.toJSON(cache);

    // return
    return {
      ...sanitised,

      install : {
        id        : this.get('id'),
        consent   : this.get('consent'),  
        version   : this.get('version'),
        createdAt : this.get('createdAt'),
        updatedAt : this.get('updatedAt'),
      },
    };
  }

  /**
   * removes follower
   */
  async remove() {
    // super
    const removing = super.remove();

    // to
    const appId = this.__data.app.toLowerCase();
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