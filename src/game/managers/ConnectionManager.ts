import type { Connection } from "../types/Connection";
//this one just checks connections

export default class ConnectionManager {
    private rightConnections: Connection[];
    private interactions: Connection[];

    constructor(
        rightConnections: Connection[],
        interactions: Connection[],
    ){
        this.rightConnections = rightConnections;
        this.interactions = interactions;
    }

    public checkConnections() {
    //if every right connection is found in current interactions list returns true else false
    console.log(
      this.rightConnections.every((connection) =>
        this.interactions.includes(connection),
      ),
    );
    if (
      this.rightConnections.length === this.interactions.length &&
      this.rightConnections.every((x) =>
        this.interactions.some((y) => x.from === y.from && x.to === y.to),
      )
    ) {
      return true;
    } else {
      return false;
    }
  }


}