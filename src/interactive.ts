import input from '@inquirer/input';
import confirm from '@inquirer/confirm';
import c, { ChalkInstance } from 'chalk';
import { createDir, gitInit } from './steps/workspace';

const theme = {
  prefix: {
    idle: c.dim('└'),
    done: c.dim('│'),
  },
};

let inSection = false;

function end() {
  const width = process.stdout.columns;
  if (inSection) {
    inSection = false;
    console.log(c.dim(`│\n╰${'─'.repeat(width - 1)}`));
  }
}

function section(title: string, color: ChalkInstance = c.blueBright) {
  end();
  inSection = true;

  const width = process.stdout.columns;
  const reserved = 4 + title.length;
  const right = width - reserved;
  console.log(
    `\n${c.dim('╭─')} ${color.bold(title)} ${c.dim('─'.repeat(right))}\n${c.dim(
      '│'
    )}`
  );
}

function abort() {
  console.log(c.bold.redBright('\nAborted.'));
  process.exit(1);
}

function err(fn: () => any) {
  try {
    fn();
  } catch (e: unknown) {
    console.log(c.bold.redBright(`\n${(e as Error).message}`));
    process.exit(1);
  }
}

function nl() {
  console.log(c.dim('│'));
}

export async function createInteractive() {
  {
    section('\uf413  Workspace');

    const directory = process.argv[2]
      ? process.argv[2]
      : ((await input({
          message: 'Where do you want to create the new workspace?',
          default: './',
          required: true,
          theme,
        }).catch(abort)) as string);
    err(() => createDir(directory));

    nl();

    const useGit = await confirm({
      message: 'Do you want to use \ue702 Git for version control?',
      default: true,
      theme,
    }).catch(abort);
    if (useGit) err(() => gitInit(directory));
  }

  {
    section('\ued0d  Node', c.greenBright);
  }

  end();
}
