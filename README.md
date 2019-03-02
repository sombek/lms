
# Exercise (3.1)
The output will be `PARENT: value = 5` because basically we are forking a new process from the parent and according to the `fork()` implementation the new process or child process going to have the exact same parent then do the manipulation in the child. 

When it comes to the parent process it is going to be waiting for the child to finish and call `exit()` so the parent can process with its process.

Regarding the shown output the output is make perfect sense which the parent process waited for the child then printed the variable `value` which equals to `5`. Someone might thought about why it is not 20? As mentioned in the first paragraph the implementation of `fork()` the parent and child are not sharing their data where each process has its own variables when forked.


# Exercise (3.2)
The following code produces 4 process including the parent process.
![alt text](https://i.ibb.co/0hdQRYx/CS480-Assignment.png)

# Exercise (4.17)
The output:
```
CHILD: value = 5
PARENT: value = 0
```

This happened after we forked the parent and then ran a thread within the child process which will change th variable `value` to 5 then we printed the first line of the output `CHILD: value = 5` and with the parent we did not change anything so `value` variable will remain as is.
