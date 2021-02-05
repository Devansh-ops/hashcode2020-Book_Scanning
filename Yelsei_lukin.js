// Not our code!!

const fs = require('fs');

const files = {
  a: {
    input: 'tasks/a_example.txt',
    output: 'results/a_result.txt',
  },
  b: {
    input: 'tasks/b_read_on.txt',
    output: 'results/b_result.txt',
  },
  c: {
    input: 'tasks/c_incunabula.txt',
    output: 'results/c_result.txt',
  },
  d: {
    input: 'tasks/d_tough_choices.txt',
    output: 'results/d_result.txt',
  },
  e: {
    input: 'tasks/e_so_many_books.txt',
    output: 'results/e_result.txt',
  },
  f: {
    input: 'tasks/f_libraries_of_the_world.txt',
    output: 'results/f_result.txt',
  },
};

const file = fs.readFileSync(files[process.env.FILE].input, 'utf-8');

const result = file.split('\n').map((item) => item.split(' '));

const readyLibraries = [];

const set = {
  booksNumber: parseInt(result[0][0]),
  deadLine: parseInt(result[0][2]),
  booksScore: [...result[1].map((it) => parseInt(it, 10))],
  libraries: [],
};

for (let i = 0; i < result[0][1]; i++) {
  const firstRow = result[i * 2 + 2];
  const secondRow = result[i * 2 + 3];

  set.libraries.push({
    daysToSignUp: parseInt(firstRow[1]),
    scanPerDay: parseInt(firstRow[2]),
    books: [
      ...secondRow
        .map((it) => parseInt(it, 10))
        .sort((a, b) => set.booksScore[b] - set.booksScore[a]),
    ],
  });
}

let signUpLibrary = null;

for (let i = 0; i < set.deadLine; i++) {
  if (!signUpLibrary) {
    signUpLibrary = findLibraryToSignUp(i);
  }

  if (signUpLibrary) {
    signUpLibrary.daysToSignUp--;

    if (signUpLibrary.daysToSignUp === 0) {
      const scannedBooks = set.libraries[signUpLibrary.id].books.slice(0, signUpLibrary.booksCount);

      readyLibraries.push({
        id: signUpLibrary.id,
        books: scannedBooks,
      });

      set.libraries[signUpLibrary.id] = undefined;

      signUpLibrary = null;

      removeDuplicates(scannedBooks);
    }
  }
}

function findLibraryToSignUp(currentDay) {
  const availableLibraries = set.libraries
    .map((library, index) => (library !== undefined ? {
      id: index,
      value: 0,
      daysToSignUp: library.daysToSignUp,
    } : undefined))
    .filter((item) => item !== undefined);

  availableLibraries.forEach((library) => {
    const activeDays = set.deadLine - currentDay - library.daysToSignUp;

    const trueLibrary = set.libraries[library.id];

    const scannedBooks = Math.min(
      activeDays * trueLibrary.scanPerDay,
      trueLibrary.books.length,
    );

    library.booksCount = scannedBooks;

    trueLibrary.books.slice(0, scannedBooks).forEach((id) => {
      library.value += set.booksScore[id];
    });

    library.value /= library.daysToSignUp;
  });

  const sorted = availableLibraries.sort((a, b) => {
    if (b.value === a.value) {
      return b.daysToSignUp - a.daysToSignUp;
    }

    return b.value - a.value;
  });

  return sorted[0];
}

function removeDuplicates(booksToRemove) {
  set.libraries.forEach((library) => {
    if (library) {
      library.books = library.books.filter(
        (book) => !booksToRemove.some((book1) => book1 === book),
      );
    }
  });
}

let results = 0;

readyLibraries.forEach((lib) => {
  lib.books.forEach((book) => {
    results += set.booksScore[book];
  })
});

console.log(`score: ${results}`);

const finalResult = [readyLibraries.length];

readyLibraries.forEach((library) => {
  finalResult.push(`${library.id} ${library.books.length}`);

  finalResult.push(library.books.join(' '));
});

fs.writeFileSync(files[process.env.FILE].output, finalResult.join('\n'));