import { t } from '@superset-ui/core';
import { HELLO_TYPE } from '../../../util/componentTypes';
import { NEW_HELLO_ID } from '../../../util/constants';
import DraggableNewComponent from './DraggableNewComponent';

export default function NewHello() {
  return (
    <DraggableNewComponent
      id={NEW_HELLO_ID}
      type={HELLO_TYPE}
      label={t('Pages')}
      className="fa fa-smile-o"
    />
  );
} 