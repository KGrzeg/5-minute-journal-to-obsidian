# Five Minute Journal to Obsidian converter

The app converts `.json` files exported from [Five Minute Journal](https://www.intelligentchange.com/products/five-minute-journal-app) to markown files, that can be read by [Obsidian](https://obsidian.md/)

## Install
```sh
🐧 npm install
```

## Run
```sh
🐧 # Run with default arguments
🐧 mkdir -p output && npm start

🐧 # Run with customized arguments
🐧 mkdir -p mymarkdowns && npm start -- -i myfile.json -o mymarkdowns

🐧 # Show the help
🐧 npm start -- --help
```

The input is a path to the `.json` file;
The output is a path to the directory that will contains `.md` files; The directory must exists before run the app.
