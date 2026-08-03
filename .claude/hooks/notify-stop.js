#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // .env 파일에서 SLACK_WEBHOOK_URL 로드
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const envPath = path.join(projectDir, '.env');
    let webhookUrl = '';

    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^\s*SLACK_WEBHOOK_URL\s*=\s*(.+?)\s*$/m);
      if (match) {
        webhookUrl = match[1];
      }
    }

    // webhook URL이 없으면 조용히 종료
    if (!webhookUrl) {
      process.exit(0);
    }

    // stdin에서 JSON 수신
    let inputJson = '';
    for await (const chunk of process.stdin) {
      inputJson += chunk.toString('utf-8');
    }

    if (!inputJson.trim()) {
      process.exit(0);
    }

    let input;
    try {
      input = JSON.parse(inputJson);
    } catch {
      process.exit(0);
    }

    // 메시지 필드 추출
    let lastMessage = input.last_assistant_message || '';
    let projectName = path.basename(input.cwd || projectDir) || 'project';

    // 메시지를 최대 200자로 자르기
    let preview = '';
    if (lastMessage) {
      if (lastMessage.length > 200) {
        preview = lastMessage.substring(0, 200) + '...';
      } else {
        preview = lastMessage;
      }
    }

    // Slack 메시지 형식 구성
    const timestamp = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    let messageText = `✅ *상태:* 작업 완료\n🕐 *시간:* ${timestamp}\n\n*프로젝트:* ${projectName}`;
    if (preview) {
      messageText += `\n\n*응답 요약:*\n${preview}`;
    }

    const slackMessage = {
      channel: '#claude-code',
      username: 'webhookbot',
      icon_emoji: ':white_check_mark:',
      text: messageText,
    };

    // Slack 웹훅으로 전송
    await sendToSlack(webhookUrl, slackMessage, projectDir);
    process.exit(0);
  } catch (error) {
    // 에러를 로그에 기록하고 종료 (Claude 작업은 막지 않음)
    try {
      const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
      const logPath = path.join(projectDir, '.claude/hooks/notify.log');
      const timestamp = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const logMessage = `[${timestamp}] ERROR: ${error.message}\n`;
      fs.appendFileSync(logPath, logMessage, 'utf-8');
    } catch {
      // 로그 기록도 실패하면 무시
    }
    process.exit(0);
  }
}

function sendToSlack(webhookUrl, message, projectDir) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(message), 'utf-8');

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(webhookUrl, options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk.toString('utf-8');
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          // 상태 코드가 200이 아니면 로그에 기록
          try {
            const logPath = path.join(projectDir, '.claude/hooks/notify.log');
            const timestamp = new Date().toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });
            const logMessage = `[${timestamp}] WARNING: Slack API returned status ${res.statusCode}\n`;
            fs.appendFileSync(logPath, logMessage, 'utf-8');
          } catch {
            // 로그 기록 실패는 무시
          }
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

main();
