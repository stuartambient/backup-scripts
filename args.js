import chalk from "chalk";

const getArgs = () => {
  const args = process.argv;
  console.log("args: ", args[2], args[3], args[4]);
  console.log("My %s has %d ears", "cat", 2);
  /* console.log("%o", String); */

  const oranges = ["orange", "orange"];
  const apples = ["just one apple"];
  oranges.forEach(fruit => {
    console.count(fruit);
  });
  apples.forEach(fruit => {
    console.count(fruit);
  });
  console.countReset("orange");

  oranges.forEach(fruit => {
    console.count(fruit);
  });
  console.trace();
  /* setTimeout(() => console.clear(), 3000); */
};

getArgs();
/* const getTime = () => console.log(new Date());
const calcTime = () => {
  console.time(getTime());
  let i = 0;
  while (i < 10000) {
    i++;
  }
  console.log(chalk.red("Hi"));
  console.time(getTime());
};

calcTime(); */
