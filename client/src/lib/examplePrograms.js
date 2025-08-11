export const EXAMPLES = {
  javascript: `// Hello World - JavaScript
console.log("Hello, World!");
`,
  python: `# Hello World - Python
print("Hello, World!")
`,
  c: `// Hello World - C
#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
  cpp: `// Hello World - C++
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
  java: `// Hello World - Java
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
`,
  csharp: `// Hello World - C#
using System;
class Program {
  static void Main() {
    Console.WriteLine("Hello, World!");
  }
}
`,
}

export const STDIN_EXAMPLE = {
  javascript: `John`,
  python: `42`,
  c: `5
10`,
  cpp: `foo bar`,
  java: `baz`,
  csharp: `qux`,
}

export const ERROR_EXAMPLES = {
  javascript: `// Runtime error example
console.log(1/0);
throw new Error("Boom");
`,
  python: `# Runtime error example
print(1/0)
`,
  c: `// Compile error example
int main() {
    return "not int";
}
`,
  cpp: `// Compile error example
int main() {
    std::string x = 5;
}
`,
  java: `// Compile error example
public class Main {
  public static void main(String[] args) {
    int x = "no";
  }
}
`,
  csharp: `// Compile error example
using System;
class Program {
  static void Main() {
    int x = "nope";
  }
}
`,
}

export const TIMEOUT_EXAMPLES = {
  javascript: `while(true) {}`,
  python: `while True: pass`,
  c: `int main(){ for(;;){} }`,
  cpp: `int main(){ for(;;){} }`,
  java: `public class Main { public static void main(String[] args){ while(true){} } }`,
  csharp: `using System; class Program { static void Main(){ for(;;){} } }`,
}
