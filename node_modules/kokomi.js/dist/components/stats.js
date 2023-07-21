import { Component } from "./component";
import StatsImpl from "stats.js";
/**
 * A drop-in fps meter powered by [stats.js](https://github.com/mrdoob/stats.js)
 */
class Stats extends Component {
    stats;
    constructor(base) {
        super(base);
        const stats = new StatsImpl();
        this.stats = stats;
        this.base.container.appendChild(this.stats.dom);
    }
    update(time) {
        this.stats.update();
    }
}
export { Stats };
