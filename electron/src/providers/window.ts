// import
import { BrowserWindow } from 'electron';

/**
 * window provider
 */
class WindowProvider {
  // variables
  public windows = new Map();

  /**
   * set tasks
   *
   * @param tasks 
   */
  setTasks(tasks) {
    // loop tasks
    tasks.forEach((task) => this.updateTask(task));
  }

  /**
   * update task
   *
   * @param task 
   */
  updateTask(task) {

    console.log('position', task.position.x, task.position.y);

    // check window exists
    if (!this.windows.has(task.id)) {
      // create new window
      this.windows.set(task.id, new BrowserWindow({
        width  : parseInt((`${task.position.width || '100px'}`.replace('px', ''))),
        height : parseInt((`${task.position.height || '100px'}`.replace('px', ''))),

        title : task.name,
      }));

      // set position
      this.windows.get(task.id).setPosition(parseInt(task.position.x), parseInt(task.position.y));
      this.windows.get(task.id).show();

      // on move
      this.windows.get(task.id).on('moved', (e) => {
        console.log('moved', e);
      });
      this.windows.get(task.id).on('resize', (e) => {
        console.log('resized', e);
      });
    }

    // update position
    this.windows.get(task.id).setPosition(parseInt(task.position.x), parseInt(task.position.y), true);
  }
}

// built
const builtWindowProvider = new WindowProvider();

// export defualt
export default builtWindowProvider;