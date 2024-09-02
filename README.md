# kweenb

## Zwerm3

Zwerm3 is a flexible audio system for streaming audio to and triggering local audio files on mobile speakers and is build by [aifoon](https://aifoon.org/).

## kweenb

![kweenb main application](https://zwerm3-docs.onrender.com/img/hero-image.png)

**kweenb** is the audio management software where you can:

- Manage the swarm by adding new bees, activating or deactivating them.
- Connect the active swarm to start streaming audio with Jacktrip, supporting both peer-to-peer and hub mode.
- Connect the active swarm to start triggering actions via OSC.
- Disconnect the swarm and cleanup all the open connections
- Adjust the Jack and Jacktrip settings used during connection.
- Upload and manage audio files on each bee
- Use positioning that interacts with the MQTT server of Pozyx and translates that data into audio parameters (e.g. volume)
- Configure the bee by calling endpoints from zwerm3-api
- Use various tools to validate each step in the connection process.

## Documentation

- The full technical documentation of Zwerm3 can be found [here](https://zwerm3-docs.onrender.com).
- The technical documentation of kweenb can be found [here](https://zwerm3-docs.onrender.com/docs/for-developers/kweenb/introduction)

## Contributing

There are many ways in which you can participate in this project, for example:

- [Reporting Bugs](CONTRIBUTING.md#1-reporting-bugs)
- [Suggesting Enhancements](CONTRIBUTING.md#2-suggesting-enhancements)
- [Submitting Pull Requests](CONTRIBUTING.md#3-submitting-pull-requests)

## Publishing

Publishing a new release is done by [the core maintainer](https://github.com/timdpaep) of this project. They will merge contributions from the community and make a new release when new features are production ready.

## Related products

- [zwerm3-jack](https://github.com/aifoon/zwerm3-jack)
- [zwerm3-api](https://github.com/aifoon/zwerm3-api)
- [pd-bee](https://github.com/aifoon/pd-bee)

## License

Copyright (c) aifoon. All rights reserved.

Licensed under the [MIT license](LICENSE).

## Big Thanks

A big thanks to the open source [Jacktrip](https://github.com/jacktrip/jacktrip) project. Their effort made this audio management application possible.

## Collaborators

- [Tim De Paepe](https://github.com/timdpaep)
- [Kasper Jordaens](https://github.com/kaosbeat)
