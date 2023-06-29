<template>
    <div pt-2 p-4 foo></div>
    <div hover:focus:p1 hover:mt1 hover:m2 pt-2 p-4></div>
    <div hover:opacity-75 opacity-50 hover:scale-150 scale-125></div>
    <div lg:grid-cols-4 grid sm:grid-cols-3 grid-cols-2></div>
    <div items-center py1 bg-gray:20 pl3 pr2 rounded-full text-xs op50 hover:op100></div>
    <div hover:pt-2 hover:p-4 foo></div>
    <div hover:(pt-2 p-4) hover:text-red hover:focus:(m1 mx2) foo></div>
    <div flex-center disblock bg-my-white items-center></div>
</template>