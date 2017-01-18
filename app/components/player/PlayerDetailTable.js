import React, { PropTypes, Component } from 'react';
import numeral from 'numeral';
import PlayerCard from './PlayerCard';

class PlayerDetailTable extends Component {
  getRating(value) {
    switch (Math.floor(value / 10)) {
      case 10:
      case 9:
      case 8:
        return 'great';
      case 7:
        return 'good';
      case 6:
        return 'average';
      case 5:
        return 'fair';
      default:
        return 'poor';
    }
  }
  render() {
    const { player } = this.props;
    let playerName;
    if (player.commonName) {
      playerName = player.commonName;
    } else {
      playerName = `${player.firstName} ${player.lastName}`;
    }

    let platformIcon;
    switch (this.props.platform) {
      case 'pc':
        platformIcon = (
          <svg className="ut-icon ut-icon-pc" viewBox="0 0 194 168">
            <path fillRule="evenodd" clipRule="evenodd" d="M64.46 0H0v167.763l41.653-.046V110.72h22.623l26.77-23.037V23.637L64.46 0zM49.07 78.42h-7.417V31.978h7.418V78.42zM122.838 0h44.878l24.236 23.637V64.92h-41.93V31.978h-8.707v103.625h8.708V95.884h41.93v48.195l-27.094 23.683h-37.875l-28.43-23.684V23.636" />
          </svg>
        );
        break;
      case 'ps3':
        platformIcon = (
          <svg className="ut-icon ut-icon-ps3" viewBox="0 0 630 135">
            <path d="M403.05.002h-82.59c-25.476 0-37.96 15.742-37.96 36.18v62.086c0 12.685-5.99 21.79-18.63 21.79h-72.24c-.506 0-.925.417-.925.898v12.53c0 .512.42.94.925.94h81.767c25.464 0 37.98-15.67 37.98-36.118V36.182c0-12.694 5.94-21.818 18.654-21.818h73.02c.573 0 1.022-.41 1.022-.92V.932c0-.49-.45-.93-1.023-.93zm-243.12 0H1C.42.002 0 .442 0 .934v12.51c0 .51.418.94.997.94H150.37c12.63 0 18.623 9.104 18.623 21.797 0 12.643-5.994 21.726-18.62 21.726H32.2C13.85 57.906 0 73.32 0 93.768v39.687c0 .543.42.974 1 .974h26.926c.527 0 .967-.432.967-.975V93.77c0-12.613 7.247-21.51 17.762-21.51H159.93c25.424 0 37.888-15.622 37.888-36.07C197.818 15.774 185.354 0 159.93 0v.002zM617.8 65.538c-.356-.4-.356-1.084 0-1.473 7.917-6.557 11.835-16.438 11.835-27.874 0-20.416-12.438-36.19-37.938-36.19H432.805c-.54 0-.94.44-.94.974v12.468c0 .513.4.942.94.942h149.35c12.594 0 18.668 9.104 18.668 21.797 0 12.643-6.033 21.726-18.666 21.726h-.186l-149.165.03c-.54 0-.94.39-.94.96V71.36c0 .5.4.9.94.9h149.35c16.47.192 18.637 16.23 18.637 24.435l.03 1.544c0 12.714-6.075 21.857-18.667 21.857h-149.35c-.543 0-.94.39-.94.9v12.49c0 .51.397.94.94.94h158.893c25.52 0 37.938-16.94 37.938-36.19V96.69c0-12.27-3.92-23.992-11.835-31.152z" />
          </svg>
        );
        break;
      case 'ps4':
        platformIcon = (
          <svg className="ut-icon ut-icon-ps4" viewBox="0 0 502.921 104.794">
            <path fill="none" d="M502.3 24.062H180.797v65.083H502.92V24.062h-.62zm-13.197 57.156h5.627v.83h-2.322v6.42h-.98v-6.42h-2.324v-.83z" />
            <path d="M491.427 88.467h.98V82.05h2.323v-.832h-5.627v.83h2.324" />
            <path fill="none" d="M502.3 24.062H180.797v65.083H502.92V24.062h-.62zm-6.668 57.156h1.352l2.102 6.19 2.033-6.19h1.18v7.25h-.81v-5.89l-1.953 5.89h-.97l-1.954-5.89v5.89h-.98v-7.25z" />
            <path d="M496.613 82.577l1.953 5.89h.97l1.954-5.89v5.89h.81v-7.25h-1.18l-2.035 6.192-2.1-6.192h-1.353v7.25h.98M335.36 71.1V41.127c0-6.115 2.855-10.494 8.942-10.494h37.547c.23 0 .45-.228.45-.454v-5.964c0-.052-.015-.103-.035-.152h-45.91c-9.95 1.265-14.81 8.2-14.81 17.064V71.1c0 6.115-2.935 10.495-8.94 10.495H272.95c-.225 0-.45.15-.45.453v5.965c0 .247.15.436.33.5h45.018c11.734-.31 17.51-7.8 17.51-17.412zM181.104 88.513h13.183c.178-.063.33-.252.33-.5V68.912c0-6.114 3.454-10.343 8.486-10.343h54.3c12.243 0 18.177-7.55 18.177-17.44 0-8.865-4.857-15.8-14.813-17.065H180.86c-.023.05-.062.09-.062.152v5.964c0 .302.15.454.45.454h71.574c6.084 0 8.938 4.38 8.938 10.494 0 6.116-2.854 10.495-8.938 10.495h-56.628c-8.787 0-15.396 7.477-15.396 17.29v19.104c0 .247.105.435.306.5z" />
            <g>
              <path fill="none" d="M393.714 74.65h60.465c.22 0 .45-.228.45-.454V36.974c0-.83-.752-.906-1.13-.604l-60.157 37.223c-.38.227-.53.453-.45.755.07.15.3.3.82.3z" />
              <path d="M382.08 81.596h72.1c.22 0 .37.15.37.302v6.116c0 .302.23.453.452.453h12.996c.23 0 .45-.15.45-.453V82.05c0-.228.23-.454.45-.454h12.916c.3 0 .45-.227.45-.452v-6.04c0-.228-.15-.454-.45-.454h-12.916c-.22 0-.45-.227-.45-.453V30.632c0-3.555-1.322-5.82-3.543-6.57h-3.76c-1.172.3-2.446.84-3.812 1.66L379.677 73.67c-3.004 1.887-4.057 4-3.305 5.586.6 1.36 2.323 2.342 5.708 2.342zm11.263-8.003L453.5 36.37c.38-.302 1.13-.226 1.13.604v37.223c0 .227-.23.453-.45.453h-60.465c-.52 0-.752-.15-.822-.302-.08-.302.07-.53.45-.755z" />
            </g>
            <g>
              <path d="M50.372 0c5.858 1.092 11.616 2.652 17.346 4.278 3.278.952 6.547 1.937 9.795 2.986 5.102 1.625 10.182 3.465 14.803 6.21 2.07 1.256 4.058 2.676 5.757 4.408 1.84 1.8 3.348 3.933 4.454 6.255 2.015 4.208 2.705 8.91 2.91 13.53.095 3.017.09 6.06-.474 9.036-.468 2.587-1.3 5.138-2.684 7.385-1.223 1.985-2.922 3.7-4.984 4.807-1.978 1.066-4.243 1.574-6.486 1.53-3.402.035-6.703-1.05-9.756-2.47-.055-10.154-.008-20.31-.024-30.46-.022-1.838.103-3.694-.267-5.506-.26-1.405-.833-2.82-1.935-3.773-.73-.66-1.678-1.03-2.63-1.232-.963-.183-1.99.226-2.586 1-.99 1.237-1.25 2.88-1.296 4.422-.008 27.18.01 54.363-.008 81.542-7.312-2.318-14.625-4.637-21.935-6.96-.008-32.33-.005-64.66 0-96.99zM17.506 68.783C27.04 65.408 36.562 62 46.1 58.637c.014 3.743 0 7.487.005 11.233-.006.508.027 1.018-.037 1.523-7.538 2.672-15.06 5.39-22.592 8.08-1.044.394-2.115.84-2.92 1.638-.375.375-.68.927-.475 1.463.26.63.903.974 1.497 1.234 1.652.672 3.458.767 5.218.848 1.962-.03 3.932-.178 5.854-.602 1.298-.255 2.548-.693 3.786-1.158 3.218-1.165 6.436-2.337 9.66-3.49.023 3.166.003 6.334.01 9.503-.01.633.028 1.27-.035 1.9-3.957.712-7.962 1.195-11.985 1.258-8.1.183-16.22-1.07-23.916-3.603-2.525-.73-5.033-1.704-7.14-3.307C1.87 84.258.832 83.13.304 81.74c-.442-1.176-.41-2.535.14-3.67.532-1.132 1.46-2.027 2.482-2.722 2.365-1.633 4.973-2.878 7.616-3.99 2.277-.97 4.64-1.727 6.964-2.575z" />
              <path d="M94.21 64.52c2.16-.25 4.337-.31 6.51-.387 7.15.027 14.338.917 21.178 3.062 1.342.408 2.642.936 3.98 1.362 2.382.87 4.768 1.927 6.676 3.64 1.147 1.046 2.135 2.455 2.15 4.064.067 1.31-.526 2.566-1.375 3.532-1.617 1.812-3.753 3.057-5.898 4.143-2.283 1.164-4.737 1.915-7.13 2.8-14.613 5.248-29.226 10.493-43.836 15.746-.002-4.092.004-8.184-.002-12.275.022-.163-.068-.448.163-.49 11.118-3.957 22.233-7.924 33.35-11.89 1.502-.562 3.12-.97 4.397-1.99.522-.41 1.033-1.06.777-1.764-.266-.614-.904-.955-1.49-1.21-1.665-.658-3.477-.786-5.247-.835-2.77.02-5.567.36-8.202 1.25-7.918 2.774-15.823 5.583-23.744 8.35 0-4.396-.002-8.788.002-13.182 5.73-2.01 11.715-3.23 17.74-3.923zM126.692 94.796c1.73-.216 3.535.56 4.57 1.96 1.132 1.447 1.34 3.533.54 5.185-.806 1.715-2.65 2.916-4.56 2.853-1.756.04-3.458-.984-4.323-2.5-.783-1.334-.876-3.043-.27-4.463.68-1.64 2.28-2.836 4.042-3.034zm-.376.923c-.968.22-1.847.806-2.425 1.613-.694.95-.957 2.205-.693 3.354.222 1.067.897 2.02 1.808 2.61 1.403.923 3.37.872 4.712-.14 1.385-.98 2.043-2.858 1.567-4.485-.294-1.1-1.08-2.036-2.07-2.58-.88-.47-1.93-.604-2.898-.373z" />
              <path d="M125.118 96.896c.9-.005 1.805 0 2.707-.003.51.007 1.072.126 1.433.517.364.41.393 1.008.293 1.523-.055.34-.355.54-.572.78.19.166.43.323.475.595.104.52-.006 1.068.16 1.578.106.18.213.362.22.578-.373.01-.746.003-1.12.01-.252-.594-.064-1.26-.22-1.872-.063-.25-.32-.404-.567-.396-.61-.026-1.222-.008-1.83-.01-.01.76.022 1.52-.018 2.277-.318-.005-.637-.005-.955 0-.016-1.86-.005-3.718-.005-5.577zm.978.884v1.54c.545.004 1.09.008 1.638.003.27-.002.586-.053.762-.283.185-.293.18-.683.014-.98-.14-.236-.437-.26-.68-.274-.58-.017-1.157-.007-1.734-.006z" />
            </g>
          </svg>
        );
        break;
      case 'x360':
        platformIcon = (
          <svg className="ut-icon ut-icon-xbox-360" viewBox="0 0 163 28">
            <path d="M106.043 14.663v-2.667h3.05c2.213 0 3.8-.454 4.763-1.36.962-.908 1.443-2.015 1.443-3.322 0-1.428-.538-2.562-1.608-3.403-1.07-.84-2.41-1.26-4.02-1.26-2.99 0-5.058 1.447-6.207 4.34h-3.03c1.73-4.66 4.91-6.99 9.545-6.99 2.603 0 4.705.693 6.308 2.08 1.604 1.385 2.405 3.05 2.405 5 0 1.512-.484 2.83-1.452 3.956-.966 1.125-2.2 1.833-3.7 2.124 1.693.242 3.148.95 4.364 2.123 1.216 1.174 1.824 2.692 1.824 4.556 0 2.212-.904 4.08-2.713 5.597-1.81 1.518-4.292 2.277-7.45 2.277-2.492 0-4.628-.592-6.406-1.78-1.78-1.185-3.42-4.587-3.703-7.777h3.12c.54 4.163 3.256 6.854 6.934 6.854 2.397 0 4.118-.51 5.164-1.534 1.047-1.02 1.57-2.24 1.57-3.657 0-1.537-.626-2.78-1.88-3.73-1.25-.95-3.008-1.425-5.27-1.425h-3.05zm33.79-7.858h-3.048c-1.028-2.698-2.903-4.047-5.626-4.047-5 0-7.55 3.372-7.66 11.466.762-1.646 1.88-2.916 3.35-3.81 1.47-.897 3.02-1.344 4.653-1.344 2.47 0 4.537.862 6.207 2.586s2.506 4.466 2.506 6.873c0 2.49-.887 4.644-2.66 6.46s-4.043 2.72-6.813 2.72c-3.158 0-5.67-1.185-7.532-3.556-1.86-2.372-2.793-5.602-2.793-9.692 0-3.993.88-7.4 2.64-10.227 1.762-2.825 4.493-4.238 8.195-4.238 4.247.002 7.108 2.27 8.584 6.807zm-9.164 18.24c1.886 0 3.432-.623 4.636-1.87 1.203-1.246 1.806-2.74 1.806-4.482 0-1.718-.587-3.866-1.76-5.094s-2.633-1.844-4.375-1.844c-1.803 0-3.372.645-4.71 1.933-1.336 1.29-2.005 3.473-2.005 5.202 0 1.598.6 3.022 1.797 4.274 1.196 1.253 2.733 1.878 4.61 1.878zm21.55 2.668c-3.192 0-5.706-1.33-7.54-3.992-1.832-2.66-2.75-5.963-2.75-9.91 0-3.87.87-7.14 2.614-9.81 1.742-2.665 4.27-4 7.586-4 3.462 0 6.054 1.39 7.778 4.175 1.724 2.783 2.586 6.05 2.586 9.8 0 3.666-.887 6.873-2.66 9.62-1.77 2.746-4.31 4.12-7.612 4.12zm.02-2.614c2.383 0 4.115-1.02 5.2-3.06 1.08-2.04 1.623-4.595 1.623-7.668 0-3.375-.554-6.183-1.66-8.42-1.107-2.24-2.877-3.358-5.31-3.358-2.36 0-4.08 1.022-5.163 3.067-1.082 2.046-1.623 4.73-1.623 8.06 0 3.46.57 6.22 1.715 8.284 1.144 2.063 2.883 3.094 5.218 3.094zM22.903.162L13.62 13.52l9.267 13.667H18.75l-7.334-11.125L3.9 27.187H0l9.375-13.503L.217.164h4.118l7.243 10.98L18.984.164h3.92zm23.44 18.71c0 1.344-.254 2.53-.76 3.558-.506 1.03-1.186 1.877-2.04 2.543-1.013.8-2.123 1.367-3.334 1.705-1.21.34-3.424.51-5.29.51h-9.538V14.065h-5.42l1.808-3.03h3.612V.162h7.966c1.963 0 4.107.073 5.083.218.978.147 2.25.45 3.14.91.987.52 1.704 1.187 2.15 2.004.445.817.67 1.793.67 2.93 0 1.283-.327 2.375-.978 3.276s-1.517 1.625-2.6 2.17v.144c1.817.375 2.913 1.177 3.96 2.405 1.05 1.226 1.573 2.78 1.573 4.653zm-5.68-12.176c0-.653-.107-1.204-.324-1.65-.217-.45-.565-.812-1.047-1.09-.566-.327-2.266-.53-3.072-.608-.806-.08-1.805-.12-2.997-.12H28.96v7.804h4.623c1.12 0 2.01-.057 2.674-.172.662-.115 1.95-.354 2.518-.717.565-.363 1.304-.832 1.54-1.407.233-.577.35-1.257.35-2.043zm1.958 12.322c0-1.09-.163-1.955-.488-2.597s-.915-1.186-1.77-1.634c-.578-.303-1.28-.5-2.104-.59-.825-.09-2.503-.136-3.684-.136H28.96V24.12h4.73c1.566 0 3.524-.083 4.523-.245 1-.164 1.818-.463 2.457-.898.675-.473 1.168-1.01 1.48-1.616.315-.604.472-1.383.472-2.34zm6.908-5.61c0 2.94.957 5.493 2.872 7.66 1.88 2.202 4.27 3.3 7.172 3.3 2.107 0 4.154-.73 6.142-2.195 2.66-1.972 3.992-4.725 3.992-8.257 0-2.808-.88-5.198-2.638-7.17-1.927-2.166-4.45-3.25-7.568-3.25-2.698 0-5.028.97-6.99 2.905-1.988 1.973-2.982 4.308-2.982 7.006zm-3.793 0c0-3.666 1.427-6.824 4.28-9.474C52.74 1.42 55.793.162 59.177.162c3.48 0 6.575 1.047 9.284 3.14 3.313 2.517 4.97 6.007 4.97 10.472 0 3.424-1.26 6.545-3.776 9.364-2.722 2.99-5.997 4.484-9.826 4.484-3.77 0-7.003-1.23-9.7-3.686-2.927-2.72-4.39-6.23-4.39-10.525zM92.954.163L83.67 13.52l9.267 13.667H88.8l-7.334-11.125-7.515 11.125h-3.9l9.376-13.503-9.16-13.52h4.12l7.243 10.98L89.033.164h3.92z" />
          </svg>
        );
        break;
      default:
        platformIcon = (
          <svg className="ut-icon ut-icon-xbox-one" viewBox="0.5 12.032 89 14">
            <path d="M35.48 18.29c.536 0 1.487-1.432 1.487-2.684 0-1.24-1.42-2.234-2.53-2.234h-5.222v4.616h-1.637l-.746 1.34h2.234v5.66h5.206s3.573-1.4 3.573-3.574-1.82-3.13-2.38-3.13l.014.006zm-4.623-3.574h2.682c1.05 0 1.636.445 1.636 1.492 0 1.043-.84 1.785-1.787 1.785h-2.523l-.01-3.273v-.004zm3.428 8.784h-3.42v-4.023h3.12c1.396 0 2.235.73 2.235 1.946 0 1.204-1.19 2.08-1.936 2.08V23.5zM7.342 12.032c-1.423 0-2.75.45-3.845 1.19.225-.064 2.088-.51 3.7 1.34 1.886-1.448 3.505-1.627 4.316-1.038-1.81 1.296-2.68 2.082-2.68 2.082s4.085 4.44 3.566 7.73c-1.387-3.127-4.214-6.247-5.058-6.54-1.7 1.536-5.05 4.86-5.197 6.537 1.25 1.457 3.113 2.387 5.197 2.387 3.78 0 6.844-3.067 6.844-6.847 0-3.778-3.065-6.838-6.844-6.838v-.003zm20.54 1.353h-1.635l-3.128 4.608-3.128-4.608h-1.93l4.02 5.81-4.02 5.798h1.786l3.128-4.612 3.127 4.613h1.93l-4.02-5.808 3.87-5.8zM6.005 15.76c-1.667-1.615-1.796-1.895-3.262-1.93C1.368 15.082.5 16.88.5 18.887c0 1.697.618 3.237 1.636 4.438-.09-2.867 2.695-6.925 3.87-7.566zm78.887 8.337v-4.32h4.163v-1.043h-4.17v-3.86h4.318v-1.196h-5.51v11.306H89.5v-.895h-4.608v.007zM43.87 13.372c-3.245 0-5.876 2.64-5.876 5.878 0 3.237 2.636 5.877 5.876 5.877 3.25 0 5.886-2.64 5.886-5.877 0-3.238-2.635-5.878-5.89-5.878h.004zm0 10.27c-2.422 0-4.388-1.967-4.388-4.39 0-2.425 1.966-4.39 4.388-4.39 2.426 0 4.394 1.97 4.394 4.39 0 2.415-1.968 4.39-4.394 4.39zM81 23.195l-6.39-9.52h-1.186V24.98h1.187v-9.66l6.407 9.673h1.19v-11.32h-1.19v9.518l-.017.004zM67.106 13.52c-2.915 0-5.28 2.636-5.28 5.882s2.365 5.873 5.28 5.873c2.914 0 5.284-2.635 5.284-5.873 0-3.242-2.36-5.882-5.28-5.882h-.004zm.08 10.726c-2.218 0-4.024-2.173-4.024-4.844 0-2.675 1.807-4.84 4.023-4.84s4.015 2.16 4.015 4.84c0 2.67-1.798 4.84-4.015 4.84v.004zM59.73 13.372H58.1l-3.133 4.612-3.116-4.617h-1.937l4.02 5.812-4.02 5.807h1.785l3.12-4.62 3.124 4.616h1.938l-4.023-5.808 3.874-5.803z" />
          </svg>
        );
        break;
    }

    /* eslint-disable max-len */
    return (
      <div className="ut-bio ut-underlay">
        <div className="ut-body-inner">
          <div className="ut-bio-details ut-bio-details--no-prices">
            <div className="ut-bio-details_group">
              <div className="ut-item-container">
                <div className="ut-item-container_header">
                  <PlayerCard player={player} />
                </div>
              </div>
              <svg id="ut-polygons-bio" className="ut-icon ut-polygons-bio" viewBox="0 0 3840 3840">
                <path className="svg-polygons-bio-1 svg-polygons-dark" d="M1529.32 1726.81c-.29.06-.58.11-.87.17l1897.2-1897.191.35.35zm-14.62 3.4L3420.38-175.474l.53.526L1516.14 1729.82zm-15.34 4.81L3415.12-180.737l.7.7L1501.53 1734.26c-.72.25-1.45.5-2.17.76zm-18.53 7.66L3409.68-186.175l.88.877L1484.1 1741.16c-1.1.49-2.19 1.01-3.27 1.52zm-22.63 12.45L3404.59-191.263l1.06 1.053L1463.63 1751.8c-1.82 1.09-3.64 2.19-5.43 3.33zM-143.877 3345.98L3398.98-196.877l1.4 1.4L-142.473 3347.38zm-5.262-5.26L3393.72-202.139l1.58 1.578L-147.561 3342.3zm-5.263-5.27L3388.45-207.4l1.76 1.754L-152.648 3337.21zm-5.263-5.26L3383.19-212.665l1.93 1.93L-157.735 3332.12zm-5.438-5.44L3377.75-218.1l2.11 2.105L-163 3326.86zm-4.562-4.56L3373.19-222.665l2.28 2.281L-167.384 3322.47zm-4.736-4.73L3368.46-227.4l2.45 2.456L-171.945 3317.91zm-4.561-4.57L3363.89-231.962l2.46 2.456L-176.506 3313.35zm-4.737-4.73L3359.16-236.7l2.81 2.807L-180.892 3308.97zm-4.561-4.56L3354.6-241.26l2.8 2.807L-185.453 3304.4zm-4.737-4.74L3349.86-246l3.16 3.158L-189.839 3300.02zM1390.8 1824.63L-137.21 3352.65l-1.053-1.06L1394.13 1819.2c-1.14 1.79-2.24 3.61-3.33 5.43zm-10.64 20.47L-132.3 3357.56l-.877-.88L1381.68 1841.83c-.51 1.08-1.03 2.17-1.52 3.27zm-6.9 17.43L-127.035 3362.82l-.7-.7L1374.02 1860.36c-.26.72-.51 1.45-.76 2.17zm-4.44 14.61L-121.948 3367.91l-.526-.53L1369.21 1875.7zm-3.01 13.18L-116.861 3373l-.35-.35 1483.191-1483.2c-.06.29-.11.58-.17.87z" />
                <path className="svg-polygons-bio-2 svg-polygons-light" d="M2676.73 1938.98l-223 222.73-4.25.01 223.01-222.75z" />
                <path className="svg-polygons-bio-3 svg-polygons-light" d="M1698.48 1487.98l-301.76 302.23-5.74.01 301.76-302.26z" />
                <path className="svg-polygons-bio-4 svg-polygons-light" d="M1506.48 1690.47l-129.53 129.74-2.47.01 129.54-129.75h2.46z" />
                <path className="svg-polygons-bio-5 svg-polygons-light" d="M530.982 4059.84L3977.84 612.982l3.16 3.157L534.139 4063zm-4.386-4.39L3973.45 608.6l2.81 2.807L529.4 4058.26zm-4.561-4.56L3968.89 604.035l2.81 2.807L524.842 4053.7zm-4.386-4.38L3964.51 599.649l2.45 2.456L520.105 4048.96zm-4.561-4.56L3959.95 595.088l2.45 2.456L515.544 4044.4zm-4.561-4.57L3955.38 590.527l2.28 2.28L510.807 4039.66zm-4.386-4.38L3951 586.141l2.1 2.105L506.246 4035.1zm-5.263-5.26L3945.74 580.878l1.93 1.93L500.808 4029.67zm-5.087-5.09L3940.65 575.791l1.75 1.754L495.545 4024.4zm-5.088-5.09L3935.56 570.7l1.58 1.579L490.282 4019.14zm-5.087-5.09L3930.47 565.616l1.41 1.4L485.019 4013.88zm-5.263-5.26L3925.21 560.353l1.05 1.053L479.406 4008.26zm-4.912-4.91L3920.3 555.441l.88.877L474.318 4003.18zm-5.263-5.26L3915.04 550.178l.7.7L468.88 3997.74zm-5.087-5.09L3909.95 545.091l.52.526L463.617 3992.47zm-5.091-5.09L3904.86 540l.35.351L458.354 3987.21z" />
                <path className="svg-polygons-bio-1 svg-polygons-dark" d="M-193.47 4021.47l-90.287-90.29L1517.01 2130.41A207.193 207.193 0 0 0 1569 2137c114.32 0 207-92.68 207-207a207.193 207.193 0 0 0-6.59-51.99L3893.44-246.026l90.29 90.289z" />
                <path className="svg-polygons-bio-1 svg-polygons-dark" d="M1673.75 1751.44a207.116 207.116 0 0 0-220.18 6.71L3525.01-313.3l106.74 106.735zM1362 1930a206 206 0 0 0 28.44 104.75L-462.295 3887.49l-106.734-106.73L1397.15 1814.57A206.074 206.074 0 0 0 1362 1930z" />
                <path className="svg-polygons-bio-7 svg-polygons-dark" d="M1587.72 2125.11l177.48-177.47c-8.42 93.84-83.29 168.64-177.48 177.47zm-35.02.22q-9.645-.795-19.01-2.47l228.96-228.97q1.74 9.3 2.59 18.9zm-24.6-3.57q-8.175-1.725-16.09-4.1l245.32-245.32q2.43 7.86 4.19 15.99zm-22.16-6.02q-6.975-2.34-13.71-5.18l257.85-257.85q2.88 6.69 5.28 13.62zm-20.13-8.04q-5.955-2.76-11.7-5.9l267.07-267.07q3.195 5.685 6.01 11.6zm-18.41-9.75q-5.07-3.045-9.93-6.38l273.35-273.36q3.375 4.83 6.47 9.85zm-16.84-11.33q-4.29-3.21-8.38-6.65l276.91-276.91q3.48 4.065 6.72 8.31zm-29.32-27.01q-2.94-3.3-5.71-6.74l276.19-276.19q3.465 2.745 6.8 5.65zm-12.53-15.64q-2.34-3.255-4.54-6.62l271.89-271.89q3.39 2.175 6.67 4.49zm-11.02-17.14q-1.815-3.165-3.49-6.39l264.82-264.82c2.17 1.11 4.3 2.26 6.42 3.45zm-9.42-18.75c-.88-2-1.73-4.01-2.54-6.05l254.73-254.73c2.05.8 4.08 1.62 6.1 2.48zm-7.64-20.54q-.855-2.8-1.64-5.65l241.2-241.19c1.9.51 3.8 1.04 5.68 1.61zm-5.51-22.65c-.31-1.7-.6-3.42-.86-5.14l223.64-223.64q2.6.375 5.18.82zm-2.88-25.29c-.08-1.51-.14-3.02-.18-4.54l201.02-201.01q2.28.045 4.56.15zm.71-28.88q.195-1.92.42-3.84l171.4-171.4c1.29-.16 2.57-.31 3.87-.44zm86.38-143.56c.81-.54 1.63-1.07 2.45-1.6l-58.64 58.63c.55-.84 1.1-1.66 1.66-2.49zm-79.72 108.74c.29-1.02.6-2.03.91-3.04l130.1-130.11c1-.31 2.02-.6 3.03-.89zm55.58 197.93q-3.585-3.3-6.98-6.76l277.84-277.85q3.5 3.375 6.83 6.92zM1569 2126c-3.78 0-7.53-.12-11.25-.33l207.86-207.86c.25 4.04.39 8.1.39 12.19 0 4.43-.16 8.82-.45 13.18l-182.31 182.31c-4.71.33-9.45.51-14.24.51z" />
              </svg>
            </div>
            <div className="ut-bio-details_group">
              <div className="ut-bio-details_headings">
                <h2 className="ut-bio-details_header--player-name">{playerName}</h2>
                <h3 className="ut-bio-details_header--item-type">{player.playerType.toUpperCase()}</h3>
              </div>
              <div className="ut-bio-prices">
                <div className="ut-bio-prices_info">
                  <div className="ut-bio-prices_tooltip-label">Price</div>
                </div>
                <div className="ut-dropdown_label">
                  <span className="ut-dropdown_label-value ng-binding">
                    {platformIcon}
                  </span>
                </div>
                <div className="ut-bio-prices_range">
                  <div className="ut-bio-prices_price">
                    <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                      {player.price && numeral(player.price.lowest).format('0,0')}
                    </span>
                    <div className="ut-bio-prices_price-label">Lowest BIN</div>
                  </div>
                  <div className="ut-bio-prices_price">
                    <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                      {player.price && numeral(player.price.buy).format('0,0')}
                    </span>
                    <div className="ut-bio-prices_price-label">Buy For</div>
                  </div>
                  <div className="ut-bio-prices_price">
                    <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                      {player.price && numeral(player.price.sell).format('0,0')}
                    </span>
                    <div className="ut-bio-prices_price-label">Sell For</div>
                  </div>
                  <div className="ut-bio-prices_price">
                    <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                      {player.price && numeral(player.price.bin).format('0,0')}
                    </span>
                    <div className="ut-bio-prices_price-label">Set BIN</div>
                  </div>
                </div>
              </div>
              <div className="ut-bio-details_stats ut-grid-view">
                <div className="ut-grid-view_item">
                  <table className="ut-bio-stats_data">
                    <tbody>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">overall</th>
                        <td className="ut-bio-stats_data-value">{player.rating}</td>
                      </tr>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">club</th>
                        <td className="ut-bio-stats_data-value">{player.club.name}</td>
                      </tr>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">league</th>
                        <td className="ut-bio-stats_data-value">{player.league.name}</td>
                      </tr>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">nation</th>
                        <td className="ut-bio-stats_data-value">{player.nation.name}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="ut-grid-view_item clear">
                  <table className="ut-bio-stats_data">
                    <tbody>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">position</th>
                        <td className="ut-bio-stats_data-value">{player.positionFull}</td>
                      </tr>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">age</th>
                        <td className="ut-bio-stats_data-value">{player.age}</td>
                      </tr>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">height</th>
                        <td className="ut-bio-stats_data-value">{player.height}</td>
                      </tr>
                      <tr className="ut-bio-stats_data-row">
                        <th className="ut-bio-stats_data-type">weight</th>
                        <td className="ut-bio-stats_data-value">{player.weight}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="ut-body-inner ut-body-inner--fixed">
          <div className="ut-bio-stats ut-grid-view">
            <div className="ut-bio-stats_item ut-grid-view_item">
              <div className="ut-bio-stats_header">
                <h6 className="ut-bio-stats_title">
                  <span className="ut-bio-stats_title-type ng-binding">pace</span>
                  <span className={`ut-bio-stats_title-value ut-bio-stats_title-value--${this.getRating(player.attributes[0].value)}`}>{player.attributes[0].value}</span>
                </h6>
                <svg className="ut-bio-stats_graph">
                  <rect className={`ut-bio-stats_graph-bar ut-bio-stats_graph-bar--${this.getRating(player.attributes[0].value)}`} height="100%" width={`${player.attributes[0].value}%`} />
                </svg>
              </div>
              <div className="ut-bio-stats_content">
                <table className="ut-bio-stats_data">
                  <tbody>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type">acceleration</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.acceleration)}`}>{player.acceleration}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type">sprint speed</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.sprintspeed)}`}>{player.sprintspeed}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ut-bio-stats_item ut-grid-view_item">
              <div className="ut-bio-stats_header">
                <h6 className="ut-bio-stats_title">
                  <span className="ut-bio-stats_title-type ng-binding">dribbling</span>
                  <span className={`ut-bio-stats_title-value ut-bio-stats_title-value--${this.getRating(player.attributes[3].value)}`}>{player.attributes[3].value}</span>
                </h6>
                <svg className="ut-bio-stats_graph">
                  <rect className={`ut-bio-stats_graph-bar ut-bio-stats_graph-bar--${this.getRating(player.attributes[3].value)}`} height="100%" width={`${player.attributes[3].value}%`} />
                </svg>
              </div>
              <div className="ut-bio-stats_content">
                <table className="ut-bio-stats_data">
                  <tbody>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">agility</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.agility)}`}>{player.agility}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">balance</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.balance)}`}>{player.balance}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">ball control</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.ballcontrol)}`}>{player.ballcontrol}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">dribbling</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.dribbling)}`}>{player.dribbling}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ut-bio-stats_item ut-grid-view_item">
              <div className="ut-bio-stats_header">
                <h6 className="ut-bio-stats_title">
                  <span className="ut-bio-stats_title-type ng-binding">shooting</span>
                  <span className={`ut-bio-stats_title-value ut-bio-stats_title-value--${this.getRating(player.attributes[1].value)}`}>{player.attributes[1].value}</span>
                </h6>
                <svg className="ut-bio-stats_graph">
                  <rect className={`ut-bio-stats_graph-bar ut-bio-stats_graph-bar--${this.getRating(player.attributes[1].value)}`} height="100%" width={`${player.attributes[1].value}%`} />
                </svg>
              </div>
              <div className="ut-bio-stats_content">
                <table className="ut-bio-stats_data">
                  <tbody>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">positioning</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.positioning)}`}>{player.positioning}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">finishing</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.finishing)}`}>{player.finishing}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">shot power</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.shotpower)}`}>{player.shotpower}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">long shots</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.longshots)}`}>{player.longshots}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">volleys</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.volleys)}`}>{player.volleys}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">penalties</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.penalties)}`}>{player.penalties}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ut-bio-stats_item ut-grid-view_item">
              <div className="ut-bio-stats_header">
                <h6 className="ut-bio-stats_title">
                  <span className="ut-bio-stats_title-type ng-binding">defending</span>
                  <span className={`ut-bio-stats_title-value ut-bio-stats_title-value--${this.getRating(player.attributes[4].value)}`}>{player.attributes[4].value}</span>
                </h6>
                <svg className="ut-bio-stats_graph">
                  <rect className={`ut-bio-stats_graph-bar ut-bio-stats_graph-bar--${this.getRating(player.attributes[4].value)}`} height="100%" width={`${player.attributes[4].value}%`} />
                </svg>
              </div>
              <div className="ut-bio-stats_content">
                <table className="ut-bio-stats_data">
                  <tbody>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">interceptions</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.interceptions)}`}>{player.interceptions}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">heading accuracy</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.headingaccuracy)}`}>{player.headingaccuracy}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">marking</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.marking)}`}>{player.marking}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">standing tackle</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.standingtackle)}`}>{player.standingtackle}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">sliding tackle</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.slidingtackle)}`}>{player.slidingtackle}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ut-bio-stats_item ut-grid-view_item">
              <div className="ut-bio-stats_header">
                <h6 className="ut-bio-stats_title">
                  <span className="ut-bio-stats_title-type ng-binding">passing</span>
                  <span className={`ut-bio-stats_title-value ut-bio-stats_title-value--${this.getRating(player.attributes[2].value)}`}>{player.attributes[2].value}</span>
                </h6>
                <svg className="ut-bio-stats_graph">
                  <rect className={`ut-bio-stats_graph-bar ut-bio-stats_graph-bar--${this.getRating(player.attributes[2].value)}`} height="100%" width={`${player.attributes[2].value}%`} />
                </svg>
              </div>
              <div className="ut-bio-stats_content">
                <table className="ut-bio-stats_data">
                  <tbody>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">vision</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.vision)}`}>{player.vision}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">crossing</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.crossing)}`}>{player.crossing}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">free kick accuracy</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.freekickaccuracy)}`}>{player.freekickaccuracy}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">short passing</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.shortpassing)}`}>{player.shortpassing}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">long passing</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.longpassing)}`}>{player.longpassing}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">curve</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.curve)}`}>{player.curve}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ut-bio-stats_item ut-grid-view_item">
              <div className="ut-bio-stats_header">
                <h6 className="ut-bio-stats_title">
                  <span className="ut-bio-stats_title-type ng-binding">physicality</span>
                  <span className={`ut-bio-stats_title-value ut-bio-stats_title-value--${this.getRating(player.attributes[5].value)}`}>{player.attributes[5].value}</span>
                </h6>
                <svg className="ut-bio-stats_graph">
                  <rect className={`ut-bio-stats_graph-bar ut-bio-stats_graph-bar--${this.getRating(player.attributes[5].value)}`} height="100%" width={`${player.attributes[5].value}%`} />
                </svg>
              </div>
              <div className="ut-bio-stats_content">
                <table className="ut-bio-stats_data">
                  <tbody>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">jumping</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.jumping)}`}>{player.jumping}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">stamina</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.stamina)}`}>{player.stamina}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">strength</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.strength)}`}>{player.strength}</td>
                    </tr>
                    <tr className="ut-bio-stats_data-row">
                      <th className="ut-bio-stats_data-type ng-binding">aggression</th>
                      <td className={`ut-bio-stats_data-value ut-bio-stats_data-value--${this.getRating(player.aggression)}`}>{player.aggression}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    /* eslint-enable max-len */
  }
}

PlayerDetailTable.propTypes = {
  player: PropTypes.shape({}),
  platform: PropTypes.string,
};

export default PlayerDetailTable;
