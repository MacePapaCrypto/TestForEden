
import Model, { Type } from '../base/model';
import AppModel from './app';

/**
 * export model
 */
@Type('appVersion')
export default class AppVersionModel extends Model {
  
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
  static async findByAppVersion(appId, version) {
    // find by ref
    return (await AppVersionModel.findByRef(`${appId}:${version}`, 1))[0];
  }
}