Здесь место для фронта, установлены: TailwindCSS (уже подключен), R3F, react-three-drei. Даунгрейднул реакт до 19.2.8, потому что R3F lastest stable 9.7.0 поддерживает диапазон 19-19.2. Motion (Framer Motion)


Переделал фронт под TypeScript.


Как коммитить:

Перед началом работы git pull origin main
После окончания работы на фичей
git checkout -b feature/feature-name
git add .
git commit -m "feature"
git push -u origin feature/feature-name

На гитхабе в пулл реквестах подтвердить пулл и мердж
git branch -d feature/feature-name
git checkout main


Conventional commits: 

test: --------- 
fix: --------
feat: --------
chore: -----------
...
