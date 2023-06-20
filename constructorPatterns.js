const newObjA = {};
const newObjB = Object.create(Object.prototype);
const newObjC = new Object();

console.log(newObjA, newObjB, newObjC);

//ECMA 3
newObjA.mykey = "hello world";

// GET PROPERTIES
const key = newObjA.mykey;
console.log("key: ", key);

// ECMA 5
Object.defineProperty(newObjB, "mynewkey", {
  value: "for more control....",
  writable: true,
  enumerable: true,
  configurable: true,
});

console.log(newObjB);

const person = Object.create({});
const defineProp = (obj, key, value) => {
  console.log(obj, key, value);
  Object.defineProperty(obj, key, { value: value });
};

defineProp(person, "car", "Delorean");
defineProp(person, "dataOfBrith", "1981");
defineProp(person, "hasBeard", false);

console.log(person);
